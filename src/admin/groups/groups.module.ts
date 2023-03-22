import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { GroupsController } from "./groups.controller";
import { GroupsEntity } from "./groups.entity";
import { GroupsService } from "./groups.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([GroupsEntity]),
        TokensModule
    ],
    controllers: [GroupsController],
    providers: [GroupsService],
    exports: [GroupsService]
})
export class GroupsModule {

}