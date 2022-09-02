import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConcsEntity } from "./concs.entity";

@Injectable()
export class ConcsService {
    constructor(
        @InjectRepository(ConcsEntity)
        private concsRepository: Repository<ConcsEntity>
    ) { }

    getOneById(id: number): Promise<ConcsEntity> {
        return this.concsRepository.findOne({where: {id}})
    }

    getOneByIds(ids: number[]): Promise<ConcsEntity[]> {
        return this.concsRepository.findByIds(ids)
    }
}