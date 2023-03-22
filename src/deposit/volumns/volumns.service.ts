import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";
import { Repository } from "typeorm";
import { CasesEntity } from "../cases/cases.entity";
import { ConcsEntity } from "../conclusions/concs.entity";
import { VolumnsCreateDto } from "./volumns.dto";
import { VolumnsEntity } from "./volumns.entity";

Injectable()
export class VolumnsService {
    constructor(
        @InjectRepository(VolumnsEntity)
        private volumnsRepository: Repository<VolumnsEntity>,

        private tokens: TokensService
    ) {}


    async getOneByNameAndCase(token: string, volume: string, caseObj: CasesEntity): Promise<VolumnsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get volume by name`, `You have not access to get one volume by name`)
        this.tokens.tlogs(token, 'get volume by name', LogsTypes.success, `name: '${volume}'`)
        return this.volumnsRepository.findOne({
            relations: ['case'],
            where: {
                case: caseObj,
                volume
            }
        })
    }


    async getOneById(token: string, id: number): Promise<VolumnsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get volume by id`, `You have not access to get one volume by id`)
        this.tokens.tlogs(token, `get volume by id`, LogsTypes.success)
        return this.volumnsRepository.findOne(
            {
                relations: ['concs', 'concs.lists'],
                where: {id},
            })
    }


    pushConc(token: string, volume: VolumnsEntity, conc: ConcsEntity) {
        volume.concs.push(conc)
        this.volumnsRepository.save(volume)
        this.tokens.tlogs(token, `sew conc into volume`, LogsTypes.success, `c.№ ${conc.reg} : ${conc.date.toDateString()}: v.${volume.volume}`)
    }
    

    async create(token: string, volumeCreateDto: VolumnsCreateDto): Promise<VolumnsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate,`create volume`, `You have not access to create volume` )
        this.tokens.tlogs(token, `create volume`, LogsTypes.success, `name: '${volumeCreateDto.volume}'`)
        return this.volumnsRepository.save(volumeCreateDto)
    }
}