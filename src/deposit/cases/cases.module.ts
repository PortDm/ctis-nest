import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsModule } from "src/admin/logs/logs-read/logs-read.module";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { CasesEntity } from "./cases.entity";
import { CasesService } from "./cases.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CasesEntity]),
        TokensModule
    ],
    controllers: [],
    providers: [CasesService],
    exports: [CasesService],
})
export class CasesModule { }