import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { LogsController } from "./logs-read.controller";
import { LogsEntity } from "../logs.entity";
import { LogsService } from "./logs-read.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([LogsEntity]),
        TokensModule
    ],
    controllers: [LogsController],
    providers: [LogsService],
    exports: [
        // LogsService
    ],

})
export class LogsModule {

}