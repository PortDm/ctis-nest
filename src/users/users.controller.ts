import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Query, Req } from "@nestjs/common";
import { TokensEntity } from "src/tokens/tokens.entity";
import { DeleteResult } from "typeorm";
import { LoginAndPassDto, LoginResponce, UsersCreateDto, UsersUpdateDto } from "./users.dto";
import { UsersEntity } from "./users.entity";
import { UsersCrudService } from "./users-crud.service";
import { UsersLoginService } from "./users-login.service";

@Controller('users')
export class UsersController {
    constructor(
        private usersCrudService: UsersCrudService,
        private usersLoginService: UsersLoginService
    ) {}

    @Get(":tokenHash")
    getAll(@Param('tokenHash') tokenHash: string, @Req() req): Promise<UsersEntity[] | HttpException> {
        return this.usersCrudService.getAll(tokenHash)
    }

    @Get('id/:id/:token')
    getOneById(@Param('id') id: number, @Param('token') token: string): Promise<UsersEntity | HttpException> {
        return this.usersCrudService.getOneById(id, token)
    }

    @Get('login/:login/:token')
    getOneByLogin(@Param('login') login: string, @Param('token') token: string): Promise<UsersEntity> {
        return this.usersLoginService.getOneByLogin(login, token)
    }

    @Get('logins/:login/:token')
    getByLogin(@Param('login') login: string, @Param('token') token: string): Promise<UsersEntity[]> {
        return this.usersLoginService.getByLogin(login, token)
    }

    @Get('isAccessToCreate/:token')
    isAccessToCreate(@Param('token') token: string): Promise<boolean | HttpException> {
        return this.usersLoginService.isAccessToCreate(token)
    }

    @Post('create/:token')
    create(@Body() userCreate: UsersCreateDto, @Param('token') token: string): Promise<UsersEntity | HttpException> {
        return this.usersCrudService.create(userCreate, token)
    }

    @Post('login')
    login(@Body() loginAndPassDto: LoginAndPassDto): Promise<LoginResponce | null> {
        return this.usersLoginService.login(loginAndPassDto.login, loginAndPassDto.passwordAES)
    }

    @Put('update/:token')
    update(@Param('token') token: string, @Body() userUpdate: UsersUpdateDto): Promise<UsersEntity | HttpException> {
        return this.usersCrudService.update(userUpdate, token)
    }

    @Delete('delete/:id/:token')
    remove(@Param('id') id: number, @Param('token') token: string): Promise<UsersEntity | HttpException> {
        return this.usersCrudService.remove(id, token)
    }

    @Get('crypto')
    AESPass(@Body() loginAndPass: {login: string, passStr: string}) {
        return this.usersLoginService.AESPass(loginAndPass)
    }
}