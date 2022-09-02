import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccessDevicesCreate, AccessDevicesList, AccessDevicesUpdate, AccessGroupsCreate, AccessGroupsList, AccessGroupsRemove, AccessLogsList, AccessUsersCreate, AccessUsersList, AccessUsersRemove, AccessUsersUpdate, ENVERONMENTS, ResoursesAccess as ResourcesAccess } from "src/enveronments";
import { UsersEntity } from "src/users/users.entity";
import { LessThan, Repository } from "typeorm";
import { TokensEntity } from "./tokens.entity";

const TOKEN_LIFE_TIME = 1000 * 60 * 30

@Injectable()
export class TokensService {

    constructor(
        @InjectRepository(TokensEntity)
        private tokensRepository: Repository<TokensEntity>
    ) {}


    getAll(): Promise<TokensEntity[]> {
        return this.tokensRepository.find();
    }

    getOneByTokenHash(tokenHash: string): Promise<TokensEntity> {
        return this.tokensRepository.findOne({
            relations: ['user'],
            where: {
                tokenHash
            }
        })
    }

    create(user: UsersEntity): Promise<TokensEntity> {
        const CryptoJS = require('crypto-js');
        const tokenHash = CryptoJS.HmacSHA1(new Date().toString(), new Date().getTime().toString()).toString()
        return this.tokensRepository.save({tokenHash, user})
    }

    async isValidToken(tokenHash: string): Promise<TokensEntity> {
        await this.removeOlds();
        return await this.tokensRepository.findOne({
            where: {tokenHash}
        });
    }
    
    async autorisation(token: string, resourcesAccess: ResourcesAccess): Promise<boolean> {
        if(token === ENVERONMENTS.adminToken) {
            return true
        }

        this.removeOlds()
        const tokenEntity = await this.tokensRepository.createQueryBuilder('tokens')
            .leftJoin('tokens.user', 'user')
            .leftJoin('user.groups', 'groups')
            .select(['tokens.id', 'user.id', 'groups.name'])
            .where({'tokenHash': token})
            .getOne()
        if(!tokenEntity) {
            return false
        }

        const groups = tokenEntity.user.groups.map(g => g.name)
        let res: boolean[]
        switch(resourcesAccess) {
            case ResourcesAccess.UsersList: res = AccessUsersList.map(a => groups.includes(a)); break;
            case ResourcesAccess.UsersCreate: res = AccessUsersCreate.map(a => groups.includes(a)); break;
            case ResourcesAccess.UsersUpdate: res = AccessUsersUpdate.map(a => groups.includes(a)); break;
            case ResourcesAccess.UsersRemove: res = AccessUsersRemove.map(a => groups.includes(a)); break;

            case ResourcesAccess.GroupsList: res = AccessGroupsList.map(a => groups.includes(a)); break;
            case ResourcesAccess.GroupsCreate: res = AccessGroupsCreate.map(a => groups.includes(a)); break;
            case ResourcesAccess.GroupsUpdate: res = AccessGroupsCreate.map(a => groups.includes(a)); break;
            case ResourcesAccess.GroupsRemove: res = AccessGroupsRemove.map(a => groups.includes(a)); break;
            
            case ResourcesAccess.LogsList: res = AccessLogsList.map(a => groups.includes(a)); break;
            
            case ResourcesAccess.DevicesList: res = AccessDevicesList.map(a => groups.includes(a)); break;
            case ResourcesAccess.DevicesCreate: res = AccessDevicesCreate.map(a => groups.includes(a)); break;
            case ResourcesAccess.DevicesUpdate: res = AccessDevicesUpdate.map(a => groups.includes(a)); break;
            case ResourcesAccess.DevicesRemove: res = AccessDevicesList.map(a => groups.includes(a)); break;
        }

        return res.includes(true)

    }

    async removeOlds(): Promise<TokensEntity[]> {
        const tokens = await this.tokensRepository.find({
            where: {
                expiresIn: LessThan(new Date(new Date().getTime() - TOKEN_LIFE_TIME))
            }
        });
        return await this.tokensRepository.remove(tokens);
    }

}