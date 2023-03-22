import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResoursesAccess } from "src/enveronments";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { Repository } from "typeorm";
import { ConcsCreateDto, ConcSewVolumeDto, ConcsUpdateDto } from "./concs.dto";
import { ConcsEntity } from "./concs.entity";
import { ListsService } from "../lists/lists.service";
import { VolumnsService } from "../volumns/volumns.service";
import { VolumnsEntity } from "../volumns/volumns.entity";

@Injectable()
export class ConcsService {
    constructor(
        @InjectRepository(ConcsEntity)
        private concsRepository: Repository<ConcsEntity>,
        
        private tokens: TokensService,
        private listsService: ListsService,
        private volumnsService: VolumnsService
    ) { }

    async getOneById(token: string, id: number): Promise<ConcsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.ConclsList, `get one conc`, `Access denited to get one conc`)

        const conc = await this.concsRepository.createQueryBuilder('concs')
                        .leftJoinAndSelect('concs.lists', 'lists')
                        .leftJoinAndSelect('lists.points', 'points')
                        .leftJoinAndSelect('points.device', 'device')
                        .where({id})
                        .orderBy('lists.list', 'ASC')
                        .addOrderBy('points.point', 'ASC')
                        .getOne()

        // const conc = await this.concsRepository.findOne({
        //     where: {id},
        //     relations: ['lists', 'lists.points', 'lists.points.device'],
        //     order: {
        //         lists.list: 'ASC'
        //     }
        // })
        this.tokens.tlogs(token, `get one conc`, LogsTypes.success, `id=${id}; '${conc.reg}-${conc.date.toLocaleDateString()}'`)
        return conc
    }


    getByIds(ids: number[]): Promise<ConcsEntity[]> {
        return this.concsRepository.findByIds(ids)
    }


    async getAll(token: string): Promise<ConcsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.ConclsList, `get all conclusions`, `Access denited to get list conslusions`)
        this.tokens.tlogs(token, 'get all conclusions', LogsTypes.success)
        return this.concsRepository.createQueryBuilder('concs')
            .leftJoinAndSelect('concs.lists', 'lists')
            .leftJoinAndSelect('concs.volume', 'volume')
            .orderBy({
                'concs.id': 'DESC',
                'lists.list': 'ASC'
            })
            .getMany()
    }


    async getByVolume(token: string, idVolume: string): Promise<ConcsEntity[]> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesList, `get concs by volume`, `Access denided to get concs by volume`)
        this.tokens.tlogs(token, `get concs by volume`, LogsTypes.success, `id volume: ${idVolume}`)
        return this.concsRepository.find({
            where: {
                volume: idVolume
            },
            order: {
                reg: 'ASC'
            }
        })
    }


    async create(token: string, concsCreateDto: ConcsCreateDto): Promise<ConcsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.ConclsCreate, `create conclusion`, `Access denited to create conclusion`)
        if(! await this.uniq(token, concsCreateDto)) {
            throw new HttpException(`Conc is't uniq`, HttpStatus.FORBIDDEN)
        }

        const conc = await this.concsRepository.save(concsCreateDto)
        this.tokens.tlogs(token, 'create conc', LogsTypes.success, `${concsCreateDto.reg}-${concsCreateDto.date}`)
        this.createListsForThisConc(token, concsCreateDto.countOfLists, conc)
        return conc
    }


    async update(token: string, id: number, concUpdateDto: ConcsUpdateDto): Promise<ConcsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.ConclsCreate, `update conclusion`, `Access denited to update conclusion`)

        let concUpdate = await this.getOneById(token, id)
        console.log(`conc update -> reg: ${concUpdateDto.reg} : ${concUpdate.reg}; date: ${concUpdateDto.date} : ${concUpdate.date}`)
        if((concUpdate.reg === concUpdateDto.reg) 
            && new Date(concUpdate.date).toString() === new Date(concUpdateDto.date).toString()) {
                throw new HttpException(`Conc update itself`, HttpStatus.FORBIDDEN)
        }

        if(! await this.uniq(token, concUpdateDto)) {
            throw new HttpException(`Conc is't uniq`, HttpStatus.FORBIDDEN)
        }

        // Object.assign(concUpdate, concUpdateDto)
        this.concsRepository.update(id, concUpdateDto)
        // this.concsRepository.save(concUpdate)
        this.tokens.tlogs(token, 'update conc', LogsTypes.success, `${concUpdate.reg}-${concUpdate.date}`)

        // this.createListsForThisConc(token, concsCreateDto.countOfLists, conc)
        return concUpdate
    }


    async uniq(token: string, concsCreateDto: ConcsCreateDto | ConcsUpdateDto): Promise<boolean> {
        await this.tokens.autorisation(token, ResoursesAccess.ConclsCreate, `create conclusion`, `Access denited to create conclusion`)
        
        if(!concsCreateDto.reg || !concsCreateDto.date) {
            return false
        }
        
        const concs: ConcsEntity[] = await this.concsRepository.find({
            where: {
                reg: concsCreateDto.reg.trim(),
                date: new Date(concsCreateDto.date)
            }
        })

        if(concs.length) {
            this.tokens.tlogs(token, `Conc is't uniq`, LogsTypes.warning, `${concsCreateDto.reg}-${concsCreateDto.date}`)
            return false
        } else {
            this.tokens.tlogs(token, `uniq conc`, LogsTypes.success, `${concsCreateDto.reg}-${concsCreateDto.date}`)
            return true
        }
        
    }


    createListsForThisConc(token: string, countOfLists: number, conc: ConcsEntity) {
        for(let numList = 1; numList <= countOfLists; numList++) {
            const listCreateDto = {
                list: numList,
                conc
            }
            this.listsService.create(token, listCreateDto)
        }
    }

    async sewIntoVolume(token: string, concsSewVolumeDto: ConcSewVolumeDto): Promise<ConcsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `sew conc into volume`, `You don't have access to sew conc into volume`)
        if( await this.intersectionLists(token, concsSewVolumeDto)) {
            throw new HttpException(`Intersection lists`, HttpStatus.FORBIDDEN)
        }

        const conc = await this.getOneById(token, concsSewVolumeDto.concId)
        const volume = await this.volumnsService.getOneById(token, concsSewVolumeDto.volumeId)
        this.volumnsService.pushConc(token, volume, conc)
        let lists = conc.lists.sort((l1, l2) => l1.list > l2.list ? 1 : -1)
        lists.forEach(l => {
            this.listsService.updateList(token, l, concsSewVolumeDto.startList++)
        })
        return this.concsRepository.save(conc)
    }


    async intersectionLists(token: string, concsSewVolumeDto: ConcSewVolumeDto): Promise<boolean> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `intersection lists`, `You don't have access intersection lists`)

        const conc = await this.getOneById(token, concsSewVolumeDto.concId)
        const volume = await this.volumnsService.getOneById(token, concsSewVolumeDto.volumeId)
        if(!conc || !volume) {
            return true
        }

        const endList = concsSewVolumeDto.startList + conc.countOfLists  - 1
        let intersection = false
        volume.concs.forEach(conc => {
            conc.lists.forEach(list => {
                if(list.list >= concsSewVolumeDto.startList && list.list <= endList) {
                    intersection = true
                }
            })
        })

        this.tokens.tlogs(token, `intersection lists`, LogsTypes.success, 
            `v.${volume.volume}(vId.${volume.id}): intersection start list ${concsSewVolumeDto.startList} is ${intersection}`)
        return intersection
    }

    // async addDevs(token: string, concId: string, devIds: string[]): Promise<ConcsEntity | HttpException> {
    //     // if(! await this.tokens.autorisation(token, ResoursesAccess.ConclsUpdate)) {
    //     //     this.logs.write(token, 'add device to conc', LogsTypes.access_denied)
    //     //     throw new HttpException(`Access denited add device to conclusion`, HttpStatus.FORBIDDEN)
    //     // }

    //     return

    //     // let devs: DevicesEntity[] = []
    //     // return this.devService.getByIds(devIds)
    //     //     .then(ds => {
    //     //         devs = ds
    //     //         return this.getOneById(token, concId)
    //     //     }).then(c => {
    //     //         if(c.devices) {
    //     //             // c.devices.concat(devs)
    //     //             devs.forEach(d => c.devices.push(d))
    //     //             console.log(`c.devices: true ${c.devices.length}`)
    //     //         }
    //     //         else {
    //     //             c.devices = devs
    //     //             console.log(`c.devices: false`)
    //     //         }

    //     //         this.logs.write(token, `add devices to conc: ${devs.length} em`, LogsTypes.success)
    //     //         return this.concsRepository.save(c)
    //     //     })
    // } 
}