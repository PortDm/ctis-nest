import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsModule } from "src/admin/logs/logs-read/logs-read.module";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { CasesModule } from "../cases/cases.module";
import { YearsController } from "./years.controller";
import { YearsEntity } from "./years.entity";
import { YearsService } from "./years.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([YearsEntity]),
        TokensModule,
        CasesModule
    ],
    controllers: [YearsController],
    providers: [YearsService],
    exports: [YearsService]
})
export class YearsModule { }