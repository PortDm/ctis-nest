import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResoursesAccess } from "src/enveronments";
import { TokensEntity } from "src/tokens/tokens.entity";
import { TokensService } from "src/tokens/tokens.service";
import { Between, ILike, LessThan, Like, MoreThan, Repository } from "typeorm";
import { Filters, LogsTypes } from "./logs.dto";
import { LogsEntity } from "./logs.entity";

const TIME_KEEP_LOGS = 1000 * 3600 * 24 * 30 * 12 * 5 // ~5 years

@Injectable()
export class LogsService {
    
    constructor(
        @InjectRepository(LogsEntity)
        private logsRepository: Repository<LogsEntity>,

        private tokensService: TokensService
    ) { }

    getAll(token: string): Promise<LogsEntity[] | HttpException> {
        const isAccess = this.tokensService.autorisation(token, ResoursesAccess.LogsList)
        if(!isAccess) {
            this.write(token, 'get all logs', LogsTypes.access_denied)
            throw new HttpException(`Don't have access to list logs`, HttpStatus.FORBIDDEN)
        }

        this.write(token, 'get all logs', LogsTypes.success)
        return this.logsRepository.find({
            order: {
                date: 'DESC'
            }
        })
    }

    async filter(token: string, filters: Filters): Promise<LogsEntity[] | HttpException> {
         const isAccess = this.tokensService.autorisation(token, ResoursesAccess.LogsList)
         if(!isAccess) {
             this.write(token, 'get filter logs', LogsTypes.access_denied)
             throw new HttpException(`Don't have acces to filter logs`, HttpStatus.FORBIDDEN)
         }

        const type = filters.type === 'all' ? '' : filters.type 
        const startDate = filters.startDate ? filters.startDate : (await this.minDate())['min']
        const endDate = filters.endDate ? filters.endDate : (await this.maxDate())['max']

         this.write(token, 'get filter logs', LogsTypes.success, `${filters.master} ${filters.action} ${type} ${filters.startDate}-${filters.endDate}`)
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

    async write(tokenHash: string, action: string, type: LogsTypes,  data: string = '') {
        this.removeOlds()

        const token: TokensEntity = await this.tokensService.getOneByTokenHash(tokenHash)
        let master = 'no master'
        if(token?.user) {
            master = token.user.login
        }

        this.logsRepository.save({ type, master, action, data })
    }

    async removeOlds() {
        await this.logsRepository.delete({
                date: LessThan(new Date(Date.now() - TIME_KEEP_LOGS) )
        })
    }
}