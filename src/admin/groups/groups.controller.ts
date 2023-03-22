import { Body, Controller, Delete, Get, HttpException, Param, Post, Put } from "@nestjs/common";
import { DeleteResult } from "typeorm";
import { GroupsCreateDto, GroupsUniwDto as GroupsUniqDto, GroupsUpdateDto } from "./groups.dto";
import { GroupsEntity } from "./groups.entity";
import { GroupsService } from "./groups.service";

@Controller('groups')
export class GroupsController {

    constructor(
        private groupsService: GroupsService
    ) { }

    @Get(':token') 
    getAll(@Param('token') token: string): Promise<GroupsEntity[] | HttpException> {
        return this.groupsService.getAll(token)
    }

    @Get('onegroup/:id/:token')
    getOne(@Param('id') id: number, @Param('token') token: string): Promise<GroupsEntity | HttpException> {
        return this.groupsService.getById(id, token)
    }

    @Get('isAccessToCreate/:token')
    isAccessToCreate(@Param('token') token: string): Promise<boolean | HttpException> {
        return this.groupsService.isAccessToCreate(token)
    }

    @Post('uniq/:token')
    uniq(@Param('token') token: string, @Body() group: GroupsUniqDto): Promise<GroupsEntity[] | HttpException> {
        return this.groupsService.uniq(group, token)
    }

    @Post('create/:token')
    create(@Body() groupCreate: GroupsCreateDto, @Param('token') token: string): Promise<GroupsEntity | HttpException> {
        return this.groupsService.create(groupCreate, token)
    }

    @Put('update/:token')
    update(@Param('token') token: string, @Body() groupUpdate: GroupsUpdateDto): Promise<GroupsEntity | HttpException> {
        return this.groupsService.update(groupUpdate, token)
    }

    @Delete('delete/:id/:token')
    remove(@Param('id') id: number, @Param('token') token: string): Promise<GroupsEntity | HttpException> {
        return this.groupsService.remove(id, token)
    }
}