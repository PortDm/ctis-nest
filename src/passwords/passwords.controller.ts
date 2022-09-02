import { Body, Controller, Post } from "@nestjs/common";
import { PasswordsCreateDto } from "./passwords.dto";
import { PasswordsEntity } from "./passwords.entity";
import { PasswordsService } from "./passwords.service";

@Controller('passwords')
export class PasswordsController {
    constructor(
        private passService: PasswordsService
    ) {}

    @Post()
    create(@Body() passCreate: PasswordsCreateDto): Promise<PasswordsEntity> {
        return this.passService.create(passCreate)
    }
}