import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";
import { Repository } from "typeorm";
import { YearsEntity } from "../years/years.entity";
import { CasesCreateDto } from "./cases.dto";
import { CasesEntity } from "./cases.entity";
import { LogsWriteService } from "src/admin/logs/logs-write/logs-write.service";

@Injectable()
export class CasesService {
    constructor(
        @InjectRepository(CasesEntity)
        private casesRepository: Repository<CasesEntity>,

        private tokens: TokensService
    ) { }

    async getAll(token: string): Promise<CasesEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get all cases`, `You have not access to get all cases`)
        this.tokens.tlogs(token, `get all cases`, LogsTypes.success)
        return this.casesRepository.find()
    }

    async getOneByNameAndYear(token: string, caseName: string, year: YearsEntity): Promise<CasesEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get case by name`, `You have not access to get one case by name`)
        this.tokens.tlogs(token, 'get case by name', LogsTypes.success, `name: '${caseName}'`)
        return this.casesRepository.findOne({
            relations: ['year', 'volumns'],
            where: {
                year,
                case: caseName
            }
        })
    }

    async create(token: string, casesCreateDto: CasesCreateDto): Promise<CasesEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `create cases`, `You have not access to create cases`)
        this.tokens.tlogs(token, `create cases`, LogsTypes.success, `name: '${casesCreateDto.case}'`)
        return this.casesRepository.save(casesCreateDto)
    }
}