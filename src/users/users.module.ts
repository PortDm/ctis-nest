import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupsModule } from "src/groups/groups.module";

import { PasswordsModule } from "src/passwords/passwords.module";
import { TokensModule } from "src/tokens/tokens.module";
import { UsersController } from "./users.controller";
import { UsersEntity } from "./users.entity";
import { UsersCrudService } from "./users-crud.service";
import { UsersLoginService } from "./users-login.service";
import { LogsModule } from "src/logs/logs.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UsersEntity]),
        PasswordsModule,
        TokensModule,
        GroupsModule,
        LogsModule
    ],
    providers: [
        UsersCrudService,
        UsersLoginService
    ],
    controllers: [UsersController],
    exports: [UsersCrudService]
})
export class UsersModule {}