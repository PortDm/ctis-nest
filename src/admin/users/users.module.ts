import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupsModule } from "src/admin/groups/groups.module";

import { PasswordsModule } from "src/admin/passwords/passwords.module";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { UsersController } from "./users.controller";
import { UsersEntity } from "./users.entity";
import { UsersCrudService } from "./users-crud.service";
import { UsersLoginService } from "./users-login.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([UsersEntity]),
        PasswordsModule,
        GroupsModule,
        TokensModule,
    ],
    providers: [
        UsersCrudService,
        UsersLoginService
    ],
    controllers: [UsersController],
    exports: [UsersCrudService]
})
export class UsersModule {}