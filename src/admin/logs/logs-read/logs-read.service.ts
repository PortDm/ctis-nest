import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResoursesAccess } from "src/enveronments";
import { TokensService } from "src/admin/tokens/tokens.service";
import { Between, ILike, Like, Repository } from "typeorm";
import { Filters, LogsTypes } from "../logs.dto";
import { LogsEntity } from "../logs.entity";


@Injectable()
export class LogsService {
    
    constructor(
        @InjectRepository(LogsEntity)
        private logsRepository: Repository<LogsEntity>,

        private tokens: TokensService
    ) { }


    async getAll(token: string): Promise<LogsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.LogsList, `get all logs`, `Don't have access to list logs`)
        this.tokens.tlogs(token, 'get all logs', LogsTypes.success)
        return this.logsRepository.find({
            order: {
                date: 'DESC'
            }
        })
    }


    async filter(token: string, filters: Filters): Promise<LogsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.LogsList, `get filter logs`, `Don't have acces to filter logs`)

        const type = filters.type === 'all' ? '' : filters.type 
        const startDate = filters.startDate ? filters.startDate : (await this.minDate())['min']
        const endDate = filters.endDate ? filters.endDate : (await this.maxDate())['max']

        this.tokens.tlogs(token, 'get filter logs', LogsTypes.success, `${filters.master} ${filters.action} ${type} ${filters.startDate}-${filters.endDate}`)
        return this.logsRepository.find({
            where: {
                master: ILike(`%${filters.master}%`),
                action: ILike(`%${filters.action}%`),
                type: Like(`%${type}%`),
                date: Between(startDate, endDate),
            },
            order: {
                date: 'DESC'
            }
         })
    }
    
    
    minDate() {
        return this.logsRepository.createQueryBuilder('logs')
            .select("MIN(logs.date)")
            .getRawOne()
    }

    maxDate() {
        return this.logsRepository.createQueryBuilder('logs')
            .select("MAX(logs.date)", 'max')
            .getRawOne()
    }

    count(): Promise<number> {
        return this.logsRepository.count()
    }

}