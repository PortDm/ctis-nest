import { Body, Controller, Get, HttpException, Param, Post } from "@nestjs/common";
import { PointUniqDto as PointsUniqDto } from "./points.dto";
import { PointsEntity } from "./points.entity";
import { PointsService } from "./points.service";

@Controller('points')
export class PointsController {
    constructor(
        private pointsService: PointsService
    ) { }


    // @Get('getOneById/:token/:id')
    // getOneById(@Param(':token') token: string, @Param(':id') id: number): Promise<PointsEntity> {
    //     return this.pointsService.getOneById(token, id)
    // }


    @Post('uniq/:token')
    uniq(@Param('token') token: string, @Body() pointUniqDto: PointsUniqDto): Promise<boolean | HttpException> {
        return this.pointsService.uniq(token, pointUniqDto)
    }
}