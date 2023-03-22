import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";
import { CasesCreateDto } from "./cases/cases.dto";
import { CasesEntity } from "./cases/cases.entity";
import { CasesService } from "./cases/cases.service";
import { AccountCreateDto, VolumeUniqDto } from "./deposit.dto";
import { VolumnsCreateDto } from "./volumns/volumns.dto";
import { VolumnsEntity } from "./volumns/volumns.entity";
import { VolumnsService } from "./volumns/volumns.service";
import { YearsCreateDto } from "./years/years.dto";
import { YearsEntity } from "./years/years.entity";
import { YearsService } from "./years/years.service";

@Injectable()
export class DepositService {
    constructor(
        private yearsService: YearsService,
        private casesSevice: CasesService,
        private volumnsService: VolumnsService,
        private token: TokensService
    ) { }

    async createAccount(token: string, accountCreateDto: AccountCreateDto): Promise<VolumnsEntity> {
        const volumeUniqDto: VolumeUniqDto = {
            year: accountCreateDto.year,
            case: accountCreateDto.case,
            volume: accountCreateDto.volume
        }
        if( ! await this.volumeUniq(token, volumeUniqDto)) {
            this.token.tlogs(token, `create volume`, LogsTypes.warning, `not uniq: y.${accountCreateDto.year}, case ${accountCreateDto.case}, v.${accountCreateDto.volume}`)
            throw new HttpException(`Volume isn't uniq`, HttpStatus.FORBIDDEN)
        }

        let year: YearsEntity = await this.yearsService.getOneByName(token, accountCreateDto.year) 
                                    ?? await this.yearCreate(token, accountCreateDto.year)
        let caseObj: CasesEntity = await this.casesSevice.getOneByNameAndYear(token, accountCreateDto.case, year) 
                                    ?? await this.caseCreate(token, year, accountCreateDto.case)
        let volume: VolumnsEntity = await this.volumnsService.getOneByNameAndCase(token, accountCreateDto.volume, caseObj) 
                                    ?? await this.volumeCreate(token, caseObj, accountCreateDto.volume)

        return volume
    }

    
    yearCreate(token: string, year: string): Promise<YearsEntity> {
        const yearCr: YearsCreateDto = {
            year
        }
        return this.yearsService.create(token, yearCr) as Promise<YearsEntity>
    }


    caseCreate(token: string, year: YearsEntity, caseName: string): Promise<CasesEntity> {
        const caseCr: CasesCreateDto = {
            year,
            case: caseName
        }
        return this.casesSevice.create(token, caseCr) as Promise<CasesEntity>
    }


    volumeCreate(token: string, caseObj: CasesEntity, volume: string): Promise<VolumnsEntity> {
        const volumeCr: VolumnsCreateDto = {
            case: caseObj,
            volume
        }
        return this.volumnsService.create(token, volumeCr) as Promise<VolumnsEntity>
    }


    async volumeUniq(token: string, volumeUniqDto: VolumeUniqDto): Promise<boolean> {
        this.token.autorisation(token, ResoursesAccess.CasesCreate, `volume uniq`, `Don't access to uniq volume`)
        let year: YearsEntity = await this.yearsService.getOneByName(token, volumeUniqDto.year)
        let caseObj: CasesEntity = await this.casesSevice.getOneByNameAndYear(token, volumeUniqDto.case, year)
        if(!year || !caseObj) {
            return true
        }

        let overlap = false
        caseObj.volumns.forEach(volume => {
            if(volume.volume === volumeUniqDto.volume) {
                overlap = true
            }
        })

        return !overlap
    }


    // isYearByName(token: string, year: string): Promise<YearsEntity> {
    //     return this.yearsService.getOneByName(token, year)
    // }

    // isCaseByNameAndYear(token: string, caseName: string, year: YearsEntity): Promise<CasesEntity> {
    //     return this.casesSevice.getOneByNameAndYear(token, caseName, year)
    // }

    // isVolumeByNameAndCase(token: string, volume: string, caseObj: CasesEntity): Promise<VolumnsEntity> {
    //     return this.volumnsService.getOneByNameAndCase(token, volume, caseObj)
    // }
}