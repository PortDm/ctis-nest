import { Body, Controller, Get, HttpException, Param, Post } from "@nestjs/common";
import { DevicesCreateDto, DevicesUpdateDto, DeviceUniqDto as DevicesUniqDto, FilterDevisesDto } from "./devices.dto";
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

    @Get('getOne/:token/:id')
    getOne(@Param('token') token: string, @Param('id') id: string) {
        return this.devicesService.getOneById(token, id)
    }
    
    @Post('filters/:token')
    filters(@Param('token') token: string, @Body() filtersDev: FilterDevisesDto): Promise<DevicesEntity[]> | HttpException {
        return this.devicesService.filters(token, filtersDev)
    }
    
    @Post('create/:token')
    create(@Param('token') token: string, @Body() deviceCreateDto: DevicesCreateDto): Promise<DevicesEntity | HttpException> {
        return this.devicesService.create(token, deviceCreateDto)
    }
    
    @Post('update/:token/:id')
    update(@Param('token') token: string, @Param('id') id: string, @Body() deviceUpdateDto: DevicesUpdateDto): Promise<DevicesEntity | HttpException> {
        return this.devicesService.update(token, id, deviceUpdateDto)
    }

    @Get('remove/:token/:id')
    remove(@Param('token') token: string, @Param('id') id: string): Promise<DevicesEntity> {
        return this.devicesService.remove(token, id)
    }

    @Post('uniq/:token')
    uniq(@Param('token') token: string, @Body() deviceUniqDto: DevicesUniqDto): Promise<boolean | HttpException> {
        return this.devicesService.uniq(token, deviceUniqDto)
    }
}