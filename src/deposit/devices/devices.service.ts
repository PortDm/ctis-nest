import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResoursesAccess } from "src/enveronments";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { DeleteResult, Repository } from "typeorm";
import { DevicesCreate, DevicesCreateDto, DevicesUpdateDto, DeviceUniqDto, FilterDevisesDto as filtersDevisesDto } from "./devices.dto";
import { DevicesEntity } from "./devices.entity";
import { PointsService } from "../points/points.service";
import { PointsEntity } from "../points/points.entity";
import { PointsCreateDto } from "../points/points.dto";

@Injectable()
export class DevicesService {

    constructor(
        @InjectRepository(DevicesEntity)
        private devicesRepository: Repository<DevicesEntity>,

        private tokens: TokensService,
        private pointsService: PointsService
    ) { }


    async getOneById(token: string, id: string): Promise<DevicesEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.DevicesList, `get all devices`, `You haven't access to get all devices`)
        this.tokens.tlogs(token, `get all devices`, LogsTypes.success)

        return this.devicesRepository.createQueryBuilder('dev')
                .leftJoinAndSelect('dev.points', 'points')
                .leftJoinAndSelect('points.list', 'list')
                .leftJoinAndSelect('list.conc', 'conc')
                .where({id})
                .getOne()

        // return this.devicesRepository.findOne({
        //     where: {id},
        //     relations: ['points', 'points.list', 'points.list.conc']
        // })
    }


    getByIds(ids: string[]): Promise<DevicesEntity[]> {
        return this.devicesRepository.findByIds(ids)
    }
    

    async getAll(token: string): Promise<DevicesEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.DevicesList, `get all devices`, `You haven't access to get all devices`)
        this.tokens.tlogs(token, `get all devices`, LogsTypes.success)
        return this.devicesRepository.find()
    }
    
    
    async filters(token: string, filtersDev: filtersDevisesDto): Promise<DevicesEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.DevicesList, `filter devices`, `You haven't access to filter devices`)

        this.tokens.tlogs(token, `filter devices`, LogsTypes.success, `dem: '${filtersDev.dem}'; model: '${filtersDev.model}'; sn: '${filtersDev.sn}'`)
        
        return this.devicesRepository.createQueryBuilder('dev')
                .leftJoinAndSelect('dev.points', 'points')
                .leftJoinAndSelect('points.list', 'list')
                .leftJoinAndSelect('list.conc', 'conc')
                .where(`dev.sn ILike '%${filtersDev.sn.trim()}%'`)
                .andWhere(`dev.dem ILike '%${filtersDev.dem.trim()}%'`)
                .andWhere(`dev.model ILike '%${filtersDev.model.trim()}%'`)
                .limit(100)
                .getMany()
        
        // return this.devicesRepository.find({
        //     where: {
        //         sn: filtersDev.sn
        //     }
        // })

    }
    

    async create(token: string, deviceCreateDto: DevicesCreateDto): Promise<DevicesEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, 'create device', "You haven't access to create device")

        const devUniqDto: DeviceUniqDto = { sn: deviceCreateDto.sn }
        if( ! await this.uniq(token, devUniqDto) ) {
            throw new HttpException(`Device isn't uniq`, HttpStatus.FORBIDDEN)
        }

        let point: PointsEntity
        try {
            point = await this.createPoint(token, deviceCreateDto.point, deviceCreateDto.listId)
        } 
        catch(err) {
            throw new HttpException(err['message'], HttpStatus.FORBIDDEN)
        }

        const deviceCreate: DevicesCreate = {
            dem: deviceCreateDto.dem,
            model: deviceCreateDto.model,
            sn: deviceCreateDto.sn,
            points: [point]
        }
        this.tokens.tlogs(token, `create device`, LogsTypes.success, `sn: ${deviceCreate.sn}`)
        return this.devicesRepository.save(deviceCreate)
    }


    async update(token: string, id: string, deviceUpdateDto: DevicesUpdateDto): Promise<DevicesEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, 'update device', "You haven't access to update device")

        let device = await this.getOneById(token, id)
        const devUniqDto: DeviceUniqDto = { sn: deviceUpdateDto.sn }
        if(device.sn !== deviceUpdateDto.sn && !await this.uniq(token, devUniqDto)) {
            throw new HttpException(`Device isn't uniq`, HttpStatus.FORBIDDEN)
        }

        let point: PointsEntity = await this.pointsService.getOneByListIdAndPoint(token, deviceUpdateDto.listId, deviceUpdateDto.point)
        if(!point) {
            try {
                point = await this.createPoint(token, deviceUpdateDto.point, deviceUpdateDto.listId)
                this.pointsService.delete(device.points[0])
            } 
            catch(err) {
                throw new HttpException(err['message'], HttpStatus.FORBIDDEN)
            }
        }
            
        const deviceUpdate: DevicesCreate = {
            dem: deviceUpdateDto.dem,
            model: deviceUpdateDto.model,
            sn: deviceUpdateDto.sn,
            points: [point]
        }
        this.tokens.tlogs(token, `update device`, LogsTypes.success, `${deviceUpdateDto.dem}, ${deviceUpdateDto.model}, ${deviceUpdateDto.sn}, p.${deviceUpdateDto.point} `)
        for(const[key, value] of Object.entries(deviceUpdate)) {
            device[key] = value
        }
        device['id'] = +id
        return  this.devicesRepository.save(device)
    }


    async remove(token: string, id: string): Promise<DevicesEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, 'Device remove', "You haven't access to remove device")

        const deviceToRemove: DevicesEntity = await this.getOneById(token, id)
        deviceToRemove.points.forEach(point => this.pointsService.delete(point))

        return this.devicesRepository.remove(deviceToRemove)
    }


    async uniq(token: string, devUniqDto: DeviceUniqDto): Promise<boolean> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, 'Device uniq', "You haven't access to create device")

        this.tokens.tlogs(token, `Device uniq`, LogsTypes.success, `sn: ${devUniqDto.sn}`)
        if(devUniqDto.sn === `б/н`) {
            return true
        }

        const dev = await this.devicesRepository.findOne({
            where: {
                sn: devUniqDto.sn
            }
        })
        return dev ? false : true
    }


    async createPoint(token: string, point?: string, listId?: number): Promise<PointsEntity> {
        if(point) {
            const pointCreate: PointsCreateDto = {
                point: point,
                listId
            }
            let pointEntity: PointsEntity
            try {
                pointEntity = await this.pointsService.create(token, pointCreate)
            }
            catch(err) {
                // throw new HttpException(`Point isn't uniq`, HttpStatus.FORBIDDEN)
                throw new HttpException(err['message'], HttpStatus.FORBIDDEN)
            }

            return pointEntity
        }
    }

}