import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { LogsService } from "src/admin/logs/logs-read/logs-read.service";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";

@Injectable()
export class LoginsMiddleware implements NestMiddleware {

    constructor(
        private logs: LogsService,
        // private tokens: TokensService
    ) { }

    use(req: any, res: any, next: NextFunction) {
        console.log(`logining middleware tokens...`)
        console.log(`req-body-login: ${req.body.login}`)

        // this.tokens.autorisation('aba8620e7b4e5ba9b97d5a1edf0e8fb63787e2ea', ResoursesAccess.LogsList, 'get all logs', 'Bad get all logs')

        // this.logs.write(req.body.login, 'logining', LogsTypes.middleware)
        next()
    }

}