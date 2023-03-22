import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsModule } from "src/admin/logs/logs-read/logs-read.module";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { ListsEntity } from "./lists.entity";
import { ListsService } from "./lists.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ListsEntity]),
        TokensModule,
    ],
    controllers: [],
    providers: [
        ListsService
    ],
    exports: [
        ListsService
    ]
})
export class ListsModule { }