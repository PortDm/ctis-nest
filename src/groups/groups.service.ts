import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResoursesAccess } from "src/enveronments";
import { LogsTypes } from "src/logs/logs.dto";
import { LogsService } from "src/logs/logs.service";
import { TokensService } from "src/tokens/tokens.service";
import { Repository } from "typeorm";
import { GroupsCreateDto, GroupsUniwDto, GroupsUpdateDto } from "./groups.dto";
import { GroupsEntity } from "./groups.entity";

@Injectable()
export class GroupsService {

    constructor(
        @InjectRepository(GroupsEntity)
        private groupsRepository: Repository<GroupsEntity>,

        private tokensService: TokensService,
        private logs: LogsService
    ) { }


    async getAll(token: string): Promise<GroupsEntity[] | HttpException> {
        const isAutorization = await this.tokensService.autorisation(token, ResoursesAccess.GroupsList)
        if(!isAutorization) {
            this.logs.write(token, 'get all groups', LogsTypes.access_denied)
            throw new HttpException("Don't have access to list groups", HttpStatus.FORBIDDEN)
        }

        this.logs.write(token, 'get all groups', LogsTypes.success)
        return this.groupsRepository.find()
    }


    async getById(id: number, token: string): Promise<GroupsEntity | HttpException> {
        const isAutorization = await this.tokensService.autorisation(token, ResoursesAccess.GroupsList)
        if(!isAutorization) {
            this.logs.write(token, 'get one group by id', LogsTypes.access_denied, `id=${id}`)
            throw new HttpException("Don't have access to get this group", HttpStatus.FORBIDDEN)
        }

        this.logs.write(token, 'get one group by id', LogsTypes.success, `id=${id}`)
        return this.groupsRepository.findOne({
            where: {id}
        })
    }


    getByIds(ids: number[]): Promise<GroupsEntity[]> {
        return this.groupsRepository.findByIds(ids)
    }   


    async uniq(group: GroupsUniwDto, token: string): Promise<GroupsEntity[] | HttpException> {
        const isAutorization = await this.tokensService.autorisation(token, ResoursesAccess.GroupsList)
        if(!isAutorization) {
            throw new HttpException("Don't have access to get this group", HttpStatus.FORBIDDEN)
        }
        return this.groupsRepository.find({where: {name: group.name}})
    }


    async isAccessToCreate(token: string): Promise<boolean | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.GroupsCreate)
        if(!isAutorisation) {
            this.logs.write(token, 'access to create groups', LogsTypes.access_denied)
            throw new HttpException("Don't have access to create groups", HttpStatus.FORBIDDEN)
        }

        this.logs.write(token, 'access to create groups', LogsTypes.success)
        return true
    }


    async create(groupCreate: GroupsCreateDto, token: string): Promise<GroupsEntity | HttpException> {
        const isAutorization = await this.tokensService.autorisation(token, ResoursesAccess.GroupsCreate)
        if(!isAutorization) {
            this.logs.write(token, 'create groups', LogsTypes.access_denied, `'${groupCreate.name}'`)
            throw new HttpException("Don't have access to create groups", HttpStatus.FORBIDDEN)
        }

        const isUniq = await this.groupsRepository.findOne( {where: {name: groupCreate.name}})
        if(isUniq) {
            throw new HttpException("This group already exist", HttpStatus.FORBIDDEN)
        }

        const groupCreated = await this.groupsRepository.save(groupCreate)
        this.logs.write(token, 'create groups', LogsTypes.success, `'${groupCreated.name}'`)
        return groupCreated
    }


    async update(group: GroupsUpdateDto, token: string): Promise<GroupsEntity | HttpException> {
        const isAutorization = await this.tokensService.autorisation(token, ResoursesAccess.GroupsUpdate)
        if(!isAutorization) {
            this.logs.write(token, 'update groups', LogsTypes.access_denied, group.toString())
            throw new HttpException("Don't access to update group", HttpStatus.FORBIDDEN)
        }

        const isUniq = await this.groupsRepository.findOne({ where: { name: group.name } })
        if(isUniq) {
            throw new HttpException("This group already exist", HttpStatus.FORBIDDEN)
        }

        let groupUpdate = await this.groupsRepository.findOne({where: {id: group.id}})
        this.logs.write(token, 'update groups', LogsTypes.success, this.printChanges(groupUpdate, group))
        if(groupUpdate) {
            delete group.id
            groupUpdate = { ...groupUpdate, ...group }
            return this.groupsRepository.save(groupUpdate)
        } else {
            throw new HttpException("Groups not found", HttpStatus.NOT_FOUND)
        }
    }


    printChanges(groupsOld: GroupsEntity, groupsNew: GroupsUpdateDto) {
        let changes = ''
        Object.keys(groupsNew).map(key => {
            if(groupsNew[key] != groupsOld![key]) {
                changes += `(${groupsOld![key]} => ${groupsNew[key]}); `
            }
        })

        if(!changes) {
            changes = `no change (${groupsOld.name})` 
        }

        return changes
    }


    async remove(id: number, token: string): Promise<GroupsEntity | HttpException> {
        const isAutorization = await this.tokensService.autorisation(token, ResoursesAccess.GroupsRemove)
        if(!isAutorization) {
            this.logs.write(token, 'delete groups', LogsTypes.access_denied, `id=${id}`)
            throw new HttpException("Don't have access to remove groups", HttpStatus.FORBIDDEN)
        }
        
        const removeGroup = await this.groupsRepository.findOne({where: {id}})
        
        this.logs.write(token, 'delete groups', LogsTypes.success, removeGroup?.toString())
        return this.groupsRepository.remove(removeGroup)
    }


    count(): Promise<number> {
        return this.groupsRepository.count()
    }
    
}