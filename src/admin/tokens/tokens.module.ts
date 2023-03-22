import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsWriteModule } from "../logs/logs-write/logs-write.module";
import { TokenContorller } from "./tokens.controller";
import { TokensEntity } from "./tokens.entity";
import { TokensService } from "./tokens.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([TokensEntity]),
        LogsWriteModule
    ],
    controllers: [TokenContorller],
    providers: [TokensService],
    exports: [
        TokensService
    ]
})
export class TokensModule {

}