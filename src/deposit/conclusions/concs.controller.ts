import { Body, Controller, Get, HttpException, Param, Patch, Post, Put } from "@nestjs/common";
import { ConcsCreateDto, ConcSewVolumeDto, ConcsUpdateDto } from "./concs.dto";
import { ConcsEntity } from "./concs.entity";
import { ConcsService } from "./concs.service";

@Controller('concs')
export class ConcsController {
    constructor(
        private concsService: ConcsService
    ) { }

    @Get('getOne/:token/:id')
    getOneById(@Param('token') token: string, @Param('id') id: number): Promise<ConcsEntity | HttpException> {
        return this.concsService.getOneById(token, id)
    }

    @Get('getAll/:token')
    getAll(@Param('token') token: string): Promise<ConcsEntity[] | HttpException> {
        return this.concsService.getAll(token)
    }

    @Get('getByVolume/:token/:idVolume')
    getByVolume(@Param('token') token: string, @Param('idVolume') idVolume: string): Promise<ConcsEntity[] | HttpException> {
        return this.concsService.getByVolume(token, idVolume)
    }

    @Post('uniq/:token')
    uniq(@Param('token') token: string, @Body() concsCreateDto: ConcsCreateDto): Promise<boolean | HttpException> {
        return this.concsService.uniq(token, concsCreateDto)
    }

    @Post('create/:token')
    create(@Param('token') token: string, @Body() concsCreateDto: ConcsCreateDto): Promise<ConcsEntity | HttpException> {
        return this.concsService.create(token, concsCreateDto)
    }

    @Post('update/:token/:id')
    update(@Param('token') token: string, @Param('id') id: number, @Body() concUpdateDto: ConcsUpdateDto): Promise<ConcsEntity | HttpException> {
        return this.concsService.update(token, id, concUpdateDto)
    }

    @Post('intersection-lists/:token')
    intersectionLists(@Param('token') token: string, @Body() concSewVolumeDto: ConcSewVolumeDto): Promise<boolean> {
        return this.concsService.intersectionLists(token, concSewVolumeDto)
    }

    @Put('sew-into-volume/:token')
    sewIntoVolume(@Param('token') token: string, @Body() concSewVolumeDto: ConcSewVolumeDto): Promise<ConcsEntity> {
        return this.concsService.sewIntoVolume(token, concSewVolumeDto)
    }

    // @Patch('add-devs/:token/')
    // addDevs(@Param('token') token: string, @Body() concsAddDevsDto: ConcsAddDevsDto): Promise<ConcsEntity | HttpException> {
    //     return this.concsService.addDevs(token, concsAddDevsDto.concId, concsAddDevsDto.devIds)
    // }
}