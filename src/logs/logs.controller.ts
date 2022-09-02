import { Body, Controller, Get, HttpException, Param, Post } from "@nestjs/common";
import { Filters } from "./logs.dto";
import { LogsEntity } from "./logs.entity";
import { LogsService } from "./logs.service";

@Controller('logs')
export class LogsController {
    constructor(
        private logsService: LogsService
    ) { }
    
    @Get('all/:token')
    getAll(@Param('token') token: string) {
        return this.logsService.getAll(token)
    }

    @Post('filters/:token')
    filters(@Param('token') token: string, @Body() filters: Filters): Promise<LogsEntity[] | HttpException> {
        return this.logsService.filter(token, filters)
    }

    @Get('count')
    count() {
        return this.logsService.count()
    }

}