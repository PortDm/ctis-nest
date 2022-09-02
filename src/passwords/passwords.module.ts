import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PasswordsController } from "./passwords.controller";
import { PasswordsEntity } from "./passwords.entity";
import { PasswordsService } from "./passwords.service";

@Module({
    imports: [TypeOrmModule.forFeature([PasswordsEntity])],
    controllers: [PasswordsController],
    providers: [PasswordsService],
    exports: [PasswordsService]
})
export class PasswordsModule {

}

