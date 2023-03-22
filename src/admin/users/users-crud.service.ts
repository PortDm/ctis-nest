import { HttpException, HttpStatus, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UsersCreateDto, UsersUpdateDto } from "./users.dto";
import { UsersEntity } from "./users.entity";
import { ENVERONMENTS, ResoursesAccess } from "src/enveronments";
import { PasswordsService } from "src/admin/passwords/passwords.service";
import { TokensService } from "src/admin/tokens/tokens.service";
import { GroupsEntity } from "src/admin/groups/groups.entity";
import { GroupsService } from "src/admin/groups/groups.service";
import { UsersLoginService } from "./users-login.service";
import { LogsTypes } from "src/admin/logs/logs.dto";

@Injectable()
export class UsersCrudService {
    constructor(
        @InjectRepository(UsersEntity)
        private usersRepository: Repository<UsersEntity>,

        private usersLoginService: UsersLoginService,
        private passwordsService: PasswordsService,
        private tokens: TokensService,
        private groupsService: GroupsService,
    ) {}


    async getAll(token: string): Promise<UsersEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.UsersList, `get all users`, `You don't have access to list users`)
        this.tokens.tlogs(token, `get all users`, LogsTypes.success)
        return this.usersRepository.find()
    }


    async getOneById(id: number, token: string): Promise<UsersEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.UsersList, `get one users by id`, `Don't have access to users list`)
        const user = 
            await this.usersRepository.findOne({
                relations: ['groups'],
                where: {id}
            })
        this.tokens.tlogs(token, 'get one users by id', LogsTypes.access_denied, `id=${id}, '${user.login}'`)
        return user
    }


    async create(userCreate: UsersCreateDto, token: string): Promise<UsersEntity> {
        if(token !== ENVERONMENTS.adminToken) {
            await this.tokens.autorisation(token, ResoursesAccess.UsersCreate, `create user`, `Don't have access to create users`)
        }

        await this.userUniq(token, userCreate.login)
        const user: UsersEntity = await this.usersRepository.save({
            ...userCreate,
            passwordHash: this.usersLoginService.dectyptAndHash(userCreate.passwordAES, userCreate.login),
            groups: await this.groupsService.getByIds(userCreate.groupsIds)
        })
        this.passwordsService.create( {user, passAES: userCreate.passwordAES})
        this.tokens.tlogs(token, 'create users', LogsTypes.success, `'${user.login}'`)
        return user
    }


    async userUniq(token: string, login: string, id=0) {
        let isUniq = await this.usersLoginService.getByLogin(login, token)
        isUniq = isUniq.filter(u => u.id !== id)
        if(isUniq.length) {
            this.tokens.tlogs(token, `create user`, LogsTypes.warning, `Login '${login}' already exist`)
            throw new HttpException('Not unique login', HttpStatus.FORBIDDEN)
        }
    }


    async update(user: UsersUpdateDto, token: string): Promise<UsersEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.UsersRemove, `update users`, `Don't have access to remove users`)
        await this.userUniq(token, user.login, +user.id)

        // let usersUniq = await this.usersLoginService.getByLogin(user.login, token)
        // usersUniq = usersUniq.filter(u => u.id !== +user.id)
        // if(usersUniq.length) {
        //     throw new HttpException('Not unique login', HttpStatus.FORBIDDEN)
        // }

        let userUpdate = await this.usersRepository.findOne({
            relations: ['passAESOlds', 'groups', 'tokens'],
            where: {
                id: user.id
            }
        })
        
        let passwordHash = userUpdate.passwordHash
        if(user.passwordAES) {
            passwordHash = this.usersLoginService.dectyptAndHash(user.passwordAES, user.login)
        }
        
        const groups: GroupsEntity[] = await this.groupsService.getByIds(user.groupsIds)
        if(userUpdate) {
            this.tokens.tlogs(token, 'update users', LogsTypes.success, this.changesUpdate(userUpdate, user, groups))
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


    async remove(id: number, token: string): Promise<UsersEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.UsersRemove, `remove users`, `Don't have access to remove users`)

        if(+id === 1) {
            this.tokens.tlogs(token, 'remove administrator', LogsTypes.access_denied, `id=${id}`)
            throw new HttpException("Can't remove main administrator", HttpStatus.FORBIDDEN)
        }

        const userRemove = await this.usersRepository.findOne({where: {id}})
        this.tokens.tlogs(token, 'remove user', LogsTypes.success, `id=${id} (${userRemove.login})`)
        return this.usersRepository.remove(userRemove)
    }


    count(): Promise<number> {
        return this.usersRepository.count()
    }

}