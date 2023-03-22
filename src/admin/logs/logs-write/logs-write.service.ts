import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { LogsEntity } from "src/admin/logs/logs.entity";
import { Repository, LessThan } from "typeorm";

const TIME_KEEP_LOGS = 1000 * 3600 * 24 * 30 * 12 * 5 // ~5 years

@Injectable()
export class LogsWriteService {

    constructor(
        @InjectRepository(LogsEntity)
        private logsRepository: Repository<LogsEntity>

    ) { }


    async write(master: string, action: string, type: LogsTypes,  data: string = '') {
        this.removeOlds()
        this.logsRepository.save({ type, master, action, data })
    }


    async removeOlds() {
        await this.logsRepository.delete({
                date: LessThan( new Date(Date.now() - TIME_KEEP_LOGS) )
        })
    }
}