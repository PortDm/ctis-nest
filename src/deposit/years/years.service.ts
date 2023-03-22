import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";
import { Repository } from "typeorm";
import { CasesCreateDto } from "../cases/cases.dto";
import { CasesEntity } from "../cases/cases.entity";
import { CasesService } from "../cases/cases.service";
import { YearsCreateDto } from "./years.dto";
import { YearsEntity } from "./years.entity";
import { LogsWriteService } from "src/admin/logs/logs-write/logs-write.service";

@Injectable()
export class YearsService {
    constructor(
        @InjectRepository(YearsEntity)
        private yearsRepository: Repository<YearsEntity>,

        private tokens: TokensService,
        private casesService: CasesService
    ) {}

    async getAll(token: string): Promise<YearsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get all years`, `You have not access to get all years`)
        this.tokens.tlogs(token, 'get all years', LogsTypes.success)

        return this.yearsRepository.createQueryBuilder('years')
            .leftJoinAndSelect('years.cases', 'cases')
            .leftJoinAndSelect('cases.volumns', 'volumns')
            .orderBy({'years.year': 'DESC', 'cases.case': 'ASC', 'volumns.volume': 'ASC'})
            .getMany()
    }

    async getOneByName(token: string, year: string): Promise<YearsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get year by name`, `You have not access to get one year by name`)
        this.tokens.tlogs(token, 'get year by name', LogsTypes.success, `name: '${year}'`)
        return this.yearsRepository.findOne({
            where: {
                year
            }
        })
    }

    async create(token: string, yearsCreateDto: YearsCreateDto): Promise<YearsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `create years`, `You have not access to create years`)
        this.tokens.tlogs(token, 'create years', LogsTypes.success, `name: '${yearsCreateDto.year}'`)
        return this.yearsRepository.save(yearsCreateDto)
    }

    async addCase(token: string, yearId: number, caseCreateDto: CasesCreateDto): Promise<YearsEntity | HttpException> {
        const caseAdd: CasesEntity = <CasesEntity> await this.casesService.create(token, caseCreateDto)
        const year = await this.yearsRepository.findOne(yearId);
        if(!year.cases) {
            year.cases = []
        }
        year.cases.push(caseAdd);
        this.tokens.tlogs(token, `add case to year`, LogsTypes.access_denied)
        return this.yearsRepository.save(year);
    }
}