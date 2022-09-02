import { HttpException, HttpStatus, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Raw, Repository } from "typeorm";

import { LoginResponce, UsersCreateDto, UsersUpdateDto } from "./users.dto";
import { UsersEntity } from "./users.entity";
import { ENVERONMENTS, ResoursesAccess } from "src/enveronments";
import { PasswordsService } from "src/passwords/passwords.service";
import { TokensService } from "src/tokens/tokens.service";
import { GroupsEntity } from "src/groups/groups.entity";
import { GroupsService } from "src/groups/groups.service";
import { resolve } from "path";
import { UsersLoginService } from "./users-login.service";
import { LogsService } from "src/logs/logs.service";
import { LogsTypes } from "src/logs/logs.dto";

@Injectable()
export class UsersCrudService {
    constructor(
        @InjectRepository(UsersEntity)
        private usersRepository: Repository<UsersEntity>,

        private usersLoginService: UsersLoginService,
        private passwordsService: PasswordsService,
        private tokensService: TokensService,
        private groupsService: GroupsService,
        private logs: LogsService
    ) {}


    async getAll(token: string): Promise<UsersEntity[] | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersList)
        if(!isAutorisation) {
            this.logs.write(token, 'get all users', LogsTypes.access_denied)
            throw new HttpException("You don`t have access to list users", HttpStatus.FORBIDDEN)
        }
        
        this.logs.write(token, 'get all users', LogsTypes.success)
        return this.usersRepository.find()
    }


    async getOneById(id: number, token: string): Promise<UsersEntity | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersList)
        if(!isAutorisation) {
            this.logs.write(token, 'get one users by id', LogsTypes.access_denied, `id=${id}`)
            throw new HttpException("Don't have access to users list", HttpStatus.FORBIDDEN)
        }

        const user = await this.usersRepository.findOne({
                            relations: ['groups'],
                            where: {id}
                        })
        this.logs.write(token, 'get one users by id', LogsTypes.access_denied, `id=${id}, '${user.login}'`)
        return user
    }


    async create(userCreate: UsersCreateDto, token: string): Promise<UsersEntity | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersCreate)
        if(!isAutorisation) {
            this.logs.write(token, 'create users', LogsTypes.access_denied, `'${userCreate.login}'`)
            throw new HttpException("Don't have access to create users", HttpStatus.FORBIDDEN)
        }

        const isUniq = await this.usersLoginService.getOneByLogin(userCreate.login, token)
        if(isUniq) {
            throw new HttpException('No unique login', HttpStatus.FORBIDDEN)
        }

        const groups: GroupsEntity[] = await this.groupsService.getByIds(userCreate.groupsIds)
        const passwordHash = this.usersLoginService.dectyptAndHash(userCreate.passwordAES, userCreate.login)
        const user: UsersEntity = await this.usersRepository.save({
            ...userCreate,
            passwordHash,
            groups
        })
        
        this.passwordsService.create({
            user,
            passAES: userCreate.passwordAES
        })

        this.logs.write(token, 'create users', LogsTypes.success, `'${user.login}'`)
        return user
    }


    async update(user: UsersUpdateDto, token: string): Promise<UsersEntity | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersRemove)
        if(!isAutorisation) {
            this.logs.write(token, 'update users', LogsTypes.access_denied, `'${user.login}'`)
            throw new HttpException("Don't have access to remove users", HttpStatus.FORBIDDEN)
        }

        let usersUniq = await this.usersLoginService.getByLogin(user.login, token)
        usersUniq = usersUniq.filter(u => u.id !== +user.id)
        if(usersUniq.length) {
            throw new HttpException('No unique login', HttpStatus.FORBIDDEN)
        }

        let userUpdate = await this.usersRepository.findOne({
            relations: ['passAESOlds', 'groups', 'tokens'],
            where: {
                id: user.id
            }
        })

        const groups: GroupsEntity[] = await this.groupsService.getByIds(user.groupsIds)
        
        let passwordHash = userUpdate.passwordHash
        if(user.passwordAES) {
            passwordHash = this.usersLoginService.dectyptAndHash(user.passwordAES, user.login)
        }
        
        if(userUpdate) {
            this.logs.write(token, 'update users', LogsTypes.success, this.changesUpdate(userUpdate, user, groups))
            delete user.id
            userUpdate = {
                ...userUpdate,
                ...user,
                passwordHash,
                groups
            }
            const userUpdateSave = await this.usersRepository.save(userUpdate)
            
            this.passwordsService.create({
                user: userUpdateSave,
                passAES: user.passwordAES
            })
    
            return userUpdateSave
        }

        throw new HttpException('User nof found', HttpStatus.NOT_FOUND)
    }


    changesUpdate(userOld: UsersEntity, userUpdate: UsersUpdateDto, groupsUpdate: GroupsEntity[]): string {
        let changes = `id=${userOld.id}: `
        
        let groupsOldNames: string[] = userOld['groups'].map(g => g.name)
        let groupsUpdateNames: string[] = groupsUpdate.map(g => g.name)
        const groupsOff = this.diferentsGroups(groupsOldNames, groupsUpdateNames, ' groups off: ')
        const groupsOn = this.diferentsGroups(groupsUpdateNames, groupsOldNames, ' groups on: ')
        
        Object.keys(userUpdate).map(key => {
            if(key !== 'groupsIds' && key !== 'birth' && key !== 'passwordAES') {
                if(userOld[key].toString() !== userUpdate[key].toString()) {
                    changes += `(${userOld[key]}=>${userUpdate[key]});`
                }
            }
        })

        if(userOld['birth'].toJSON().split('T')[0] !== userUpdate['birth'].toString()) {
            changes += `(${userOld['birth'].toJSON().split('T')[0]}=>${userUpdate['birth']})`
        }

        const changePass = userUpdate.passwordAES ? `pass: '${userUpdate.passwordAES}'` : ''

        return changes + groupsOff + groupsOn + changePass
    }


    diferentsGroups(groupsMap: string[], groupsInclude: string[], startPrefix = ''): string {
        let result = startPrefix
        let isInclude = false
        groupsMap.map(g => {
            if(!groupsInclude.includes(g)) {
                result += g + ';'
                isInclude = true
            }
        })
        return isInclude ? result : ''
    }


    async remove(id: number, token: string): Promise<UsersEntity | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersRemove)
        if(!isAutorisation) {
            this.logs.write(token, 'remove users', LogsTypes.access_denied, `id=${id}`)
            throw new HttpException("Don't have access to remove users", HttpStatus.FORBIDDEN)
        }
        if(+id === 1) {
            this.logs.write(token, 'remove administrator', LogsTypes.access_denied, `id=${id}`)
            throw new HttpException("Can't remove main administrator", HttpStatus.FORBIDDEN)
        }

        const userRemove = await this.usersRepository.findOne({where: {id}})
        this.logs.write(token, 'remove users', LogsTypes.success, `id=${id} (${userRemove.login})`)
        return this.usersRepository.remove(userRemove)
    }


    count(): Promise<number> {
        return this.usersRepository.count()
    }

}