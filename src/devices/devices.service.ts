import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConcsEntity } from "src/conclusions/concs.entity";
import { ConcsService } from "src/conclusions/concs.service";
import { ResoursesAccess } from "src/enveronments";
import { LogsTypes } from "src/logs/logs.dto";
import { LogsService } from "src/logs/logs.service";
import { TokensService } from "src/tokens/tokens.service";
import { Repository } from "typeorm";
import { DevicesCreateDto } from "./devices.dto";
import { DevicesEntity } from "./devices.entity";

@Injectable()
export class DevicesService {

    constructor(
        @InjectRepository(DevicesEntity)
        private devicesRepository: Repository<DevicesEntity>,

        private tokensService: TokensService,
        private logsService: LogsService,
        private concsService: ConcsService
    ) { }
    
    async getAll(token: string): Promise<DevicesEntity[] | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.DevicesList)
        if(!isAutorisation) {
            this.logsService.write(token, 'get all devices', LogsTypes.access_denied)
            throw new HttpException("You haven't access to get all devices", HttpStatus.FORBIDDEN)
        }

        return this.devicesRepository.find()
    }

    async create(token: string, deviceCreateDto: DevicesCreateDto): Promise<DevicesEntity | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.DevicesCreate)
        if(!isAutorisation) {
            this.logsService.write(token, 'create device', LogsTypes.access_denied)
            throw new HttpException("You haven't access to create device", HttpStatus.FORBIDDEN)
        }

        let concsPromise: Promise<ConcsEntity[]>
        if(deviceCreateDto.concsIds) {
            concsPromise = this.concsService.getOneByIds(deviceCreateDto.concsIds)

            return concsPromise.then(concs => {
                // delete deviceCreateDto.concsIds
                return this.devicesRepository.save({
                    ...deviceCreateDto,
                    concs
                })
            })
        }

        return this.devicesRepository.save(deviceCreateDto)
    }
}