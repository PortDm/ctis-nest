import { Body, Controller, Get, HttpException, Param, Post } from "@nestjs/common";
import { DevicesCreateDto } from "./devices.dto";
import { DevicesEntity } from "./devices.entity";
import { DevicesService } from "./devices.service";

@Controller('devices')
export class DevicesController {

    constructor(
        private devicesService: DevicesService
    ) { }
    
    @Get('getAll/:token')
    getAll(@Param('token') token: string): Promise<DevicesEntity[] | HttpException> {
        return this.devicesService.getAll(token)
    }

    @Post('create/:token')
    create(@Param('token') token: string, @Body() deviceCreateDto: DevicesCreateDto): Promise<DevicesEntity | HttpException> {
        return this.devicesService.create(token, deviceCreateDto)
    }
}