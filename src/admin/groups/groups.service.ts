import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ENVERONMENTS, ResoursesAccess } from "src/enveronments";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { Repository } from "typeorm";
import { GroupsCreateDto, GroupsUniwDto, GroupsUpdateDto } from "./groups.dto";
import { GroupsEntity } from "./groups.entity";

@Injectable()
export class GroupsService {

    constructor(
        @InjectRepository(GroupsEntity)
        private groupsRepository: Repository<GroupsEntity>,

        private tokens: TokensService
    ) { }


    async getAll(token: string): Promise<GroupsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.GroupsList, `get all groups`, `You don't have access to list groups`)
        this.tokens.tlogs(token, `get all groups`, LogsTypes.success)
        return this.groupsRepository.find()
    }


    async getById(id: number, token: string): Promise<GroupsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.GroupsList, `get one group by id`, `Don't have access to get this group`)
        this.tokens.tlogs(token, 'get one group by id', LogsTypes.success, `id=${id}`)
        return this.groupsRepository.findOne({where: {id}})
    }


    getByIds(ids: number[]): Promise<GroupsEntity[]> {
        return this.groupsRepository.findByIds(ids)
    }   


    async uniq(group: GroupsUniwDto, token: string): Promise<GroupsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.GroupsList, `access to uniq group`, `Don't have access to get this group`)
        return this.groupsRepository.find({where: {name: group.name}})
    }


    async isAccessToCreate(token: string): Promise<boolean> {
        await this.tokens.autorisation(token, ResoursesAccess.GroupsCreate, `access to create groups`, `Don't have access to create groups`)
        this.tokens.tlogs(token, 'access to create groups', LogsTypes.success)
        return true
    }


    async create(groupCreate: GroupsCreateDto, token: string): Promise<GroupsEntity > {
        if(token !== ENVERONMENTS.adminToken) {
            await this.tokens.autorisation(token, ResoursesAccess.GroupsCreate, `create groups`, `Don't have access to create groups`)
        }

        await this.groupUniq(token, groupCreate.name)

        const groupCreated = await this.groupsRepository.save(groupCreate)
        this.tokens.tlogs(token, 'create groups', LogsTypes.success, `'${groupCreated.name}'`)
        return groupCreated
    }


    async update(groupUpdate: GroupsUpdateDto, token: string): Promise<GroupsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.GroupsUpdate, `update groups`,`Don't access to update group`)
        await this.groupUniq(token, groupUpdate.name)

        let group = await this.groupsRepository.findOne({where: {id: groupUpdate.id}})
        this.tokens.tlogs(token, 'update groups', LogsTypes.success, this.printChanges(group, groupUpdate))
        if(group) {
            delete groupUpdate.id
            group = { ...group, ...groupUpdate }
            return this.groupsRepository.save(group)
        } else {
            throw new HttpException("Groups not found", HttpStatus.NOT_FOUND)
        }
    }


    async groupUniq(token: string, name: string) {
        if(await this.groupsRepository.findOne( {where: {name}})) {
            this.tokens.tlogs(token, `create group`, LogsTypes.warning, `'${name}' already exist`)
            throw new HttpException("This group already exist", HttpStatus.FORBIDDEN)
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


    async remove(id: number, token: string): Promise<GroupsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.GroupsRemove, `delete groups`, `Don't have access to remove groups`)
        const removeGroup = await this.groupsRepository.findOne({where: {id}})
        this.tokens.tlogs(token, 'delete groups', LogsTypes.success, removeGroup?.toString())
        return this.groupsRepository.remove(removeGroup)
    }


    count(): Promise<number> {
        return this.groupsRepository.count()
    }
    
}