import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensModule } from "src/tokens/tokens.module";
import { LogsController } from "./logs.controller";
import { LogsEntity } from "./logs.entity";
import { LogsService } from "./logs.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([LogsEntity]),
        TokensModule
    ],
    exports: [LogsService],
    controllers: [LogsController],
    providers: [LogsService]
})
export class LogsModule {

}