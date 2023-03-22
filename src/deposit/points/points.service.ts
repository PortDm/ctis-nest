import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable, of } from "rxjs";
import { LogsTypes } from "src/admin/logs/logs.dto";
import { TokensService } from "src/admin/tokens/tokens.service";
import { ResoursesAccess } from "src/enveronments";
import { DeleteResult, Repository } from "typeorm";
import { ListsService } from "../lists/lists.service";
import { PointsCreate, PointsCreateDto, PointUniqDto } from "./points.dto";
import { PointsEntity } from "./points.entity";

@Injectable()
export class PointsService {
    constructor(
        @InjectRepository(PointsEntity)
        private pointsRepository: Repository<PointsEntity>,

        private tokens: TokensService,
        private listsService: ListsService,
    ) { }


    // getOneById(token: string, id: number): Promise<PointsEntity> {
        // await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `create point`, `You don't have access to create point`)
    //     return this.pointsRepository.findOne({
    //         where: {id},
    //         relations: ['list', 'list.conc']
    //     })
    // }


    async getOneByListIdAndPoint(token: string, listId: number, point: string): Promise<PointsEntity> {
        const list = await this.listsService.getOneById(token, listId)
        return this.pointsRepository.findOne({
            relations: ['list'],
            where: {
                list,
                point
            }
        })
    }


    async create(token: string, pointCreateDto: PointsCreateDto): Promise<PointsEntity> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `create point`, `You don't have access to create point`)
        const pointUniqDto: PointUniqDto = {
            point: pointCreateDto.point,
            listId: pointCreateDto.listId
        }
        if( ! await this.uniq(token, pointUniqDto)) {
            throw new HttpException(`Point isn't uniq`, HttpStatus.FORBIDDEN)
        }
        const list = await this.listsService.getOneById(token, pointCreateDto.listId)
        this.tokens.tlogs(token, `create point`, LogsTypes.success, `c.${list.conc.reg}-${list.conc.date.toLocaleDateString()}, list:${list.list}, p.${pointCreateDto.point}`)
        const pointCreate: PointsCreate = {
            point: pointCreateDto.point,
            list
        }
        return this.pointsRepository.save(pointCreate)
    }
    

    async delete(point: PointsEntity) {
        this.pointsRepository.remove(point)
    }


    async uniq(token: string, pointUniqDto: PointUniqDto): Promise<boolean> {
        await this.tokens.autorisation(token, ResoursesAccess.CasesCreate, `point uniq`, `You don't have access to uniq point`)
        this.tokens.tlogs(token, `uniq point`, LogsTypes.success, `p.${pointUniqDto.point}, listId: ${pointUniqDto.listId}`)
        const list = await this.listsService.getOneById(token, pointUniqDto.listId)
        let overlap = false
        list.conc?.lists.forEach(l => {
            l.points.forEach(point => {
                if(point.point === pointUniqDto.point) {
                    overlap = true
                }
            })
        })
        return !overlap
    }

}