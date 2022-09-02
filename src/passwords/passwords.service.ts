import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PasswordsCreateDto } from "./passwords.dto";
import { PasswordsEntity } from "./passwords.entity";

const PASSAESOLDS_SAVE_COUNT = 100

@Injectable()
export class PasswordsService {
    constructor(
        @InjectRepository(PasswordsEntity)
        private passRepository: Repository<PasswordsEntity>
    ) {}

    create(passCreate: PasswordsCreateDto): Promise<PasswordsEntity> {
        return this.passRepository.save(passCreate)
    }

    remove(passRemove: PasswordsEntity): Promise<PasswordsEntity> {
        return this.passRepository.remove(passRemove)
    }

    removePassOlds(passAESOlds: PasswordsEntity[]) {
        if(passAESOlds.length > PASSAESOLDS_SAVE_COUNT) {
            for(let i=0; i < (passAESOlds.length - PASSAESOLDS_SAVE_COUNT); i++) {
                this.remove(passAESOlds[i])
            }
        }
    }
}