import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";
import { Repository } from "typeorm";
import { ListsCreateDto } from "./lists.dto";
import { ListsEntity } from "./lists.entity";

@Injectable()
export class ListsService {
    constructor(
        @InjectRepository(ListsEntity)
        private listsRepository: Repository<ListsEntity>,

        private tokens: TokensService,
    ) { }

    async create(token: string, listCreateDto: ListsCreateDto): Promise<ListsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `create list`, `You don't have access to create list`)
        this.tokens.tlogs(token, `create list`, LogsTypes.success, `c.${listCreateDto.conc.reg}-${listCreateDto.conc.date}, l.${listCreateDto.list}`)
        return this.listsRepository.save(listCreateDto)
    }

    async getOneById(token: string, id: number): Promise<ListsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `get one list`, `You don't have access to get one list`)
        if(!id) {
            return new ListsEntity()
        }
        // const list = await this.listsRepository.findOne(
        //     {
        //         relations: ['conc', 'conc.list', 'conc.list.points'],
        //         where: {id},
        //     }
        // )

        const list = await this.listsRepository.createQueryBuilder('list')
            .leftJoinAndSelect('list.conc', 'conc')
            .leftJoinAndSelect('conc.lists', 'lists')
            .leftJoinAndSelect('lists.points', 'points')
            .where({id})
            .getOne()

        this.tokens.tlogs(token, `get one list`, LogsTypes.success, `c.${list.conc.reg}-${list.conc.date.toLocaleDateString()}, l.${list.list}`)
        return list
    }

    updateList(token: string, listObj: ListsEntity, list: number): Promise<ListsEntity> {
        this.tokens.tlogs(token, `updateList`, LogsTypes.success, `${listObj.list} => ${list}`)
        listObj.list = list
        return this.listsRepository.save(listObj)
    }
}