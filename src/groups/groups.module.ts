import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsModule } from "src/logs/logs.module";
import { TokensModule } from "src/tokens/tokens.module";
import { GroupsController } from "./groups.controller";
import { GroupsEntity } from "./groups.entity";
import { GroupsService } from "./groups.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([GroupsEntity]),
        TokensModule,
        LogsModule
    ],
    controllers: [GroupsController],
    providers: [GroupsService],
    exports: [GroupsService]
})
export class GroupsModule {

}