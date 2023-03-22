import { Body, Controller, Get, HttpException, Param, Patch, Post } from "@nestjs/common";
import { YearsAddCaseDto, YearsCreateDto } from "./years.dto";
import { YearsEntity } from "./years.entity";
import { YearsService } from "./years.service";

@Controller('years')
export class YearsController {
    constructor(
        private yearsService: YearsService
    ) { }

    @Get('/getAll/:token')
    getAll(@Param('token') token: string): Promise<YearsEntity[] | HttpException> {
        return this.yearsService.getAll(token)
    }

    // @Post('/create/:token')
    // create(@Param('token') token: string, @Body() yearsCreateDto: YearsCreateDto): Promise<YearsEntity | HttpException> {
    //     return this.yearsService.create(token, yearsCreateDto)
    // }

    // @Patch('/add-case/:token')
    // addCase(@Param('token') token: string, @Body() yearsAddCaseDto: YearsAddCaseDto): Promise<YearsEntity | HttpException> {
    //     return this.yearsService.addCase(token, yearsAddCaseDto.yearId, yearsAddCaseDto.caseCreateDto)
    // }
}