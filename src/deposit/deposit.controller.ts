import { Body, Controller, Param, Post } from "@nestjs/common";
import { AccountCreateDto, VolumeUniqDto } from "./deposit.dto";
import { DepositService } from "./deposit.service";
import { VolumnsEntity } from "./volumns/volumns.entity";

@Controller('deposit')
export class DepositController {
    constructor( 
        private depositService: DepositService
    ) { }

    @Post('/create-account/:token')
    createAccount(@Param('token') token: string, @Body() accountCreateDto: AccountCreateDto): Promise<VolumnsEntity> {
        return this.depositService.createAccount(token, accountCreateDto)
    }

    @Post('volume/uniq/:token')
    voluemUniq(@Param('token') token: string, @Body() volumeUniqDto: VolumeUniqDto): Promise<boolean> {
        return this.depositService.volumeUniq(token, volumeUniqDto)
    }
}