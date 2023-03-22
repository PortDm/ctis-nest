import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccessCasesCreate, AccessCasesList, AccessCasesRemove, AccessCasesUpdate, AccessConclsCreate, AccessConclsList, AccessConclsRemove, AccessConclsUpdate, AccessDevicesCreate, AccessDevicesList, AccessDevicesRemove, AccessDevicesUpdate, AccessGroupsCreate, AccessGroupsList, AccessGroupsRemove, AccessGroupsUpdate, AccessLogsList, AccessUsersCreate, AccessUsersList, AccessUsersRemove, AccessUsersUpdate, ENVERONMENTS, ResoursesAccess as ResourcesAccess } from "src/enveronments";
import { UsersEntity } from "src/admin/users/users.entity";
import { DeleteResult, LessThan, Repository } from "typeorm";
import { TokensEntity } from "./tokens.entity";
import { LogsTypes } from "../logs/logs.dto";
import { LogsWriteService } from "../logs/logs-write/logs-write.service";
import { GroupsEntity } from "../groups/groups.entity";

const TOKEN_LIFE_TIME = 1000 * 60 * 30 // ~ 30 min

@Injectable()
export class TokensService {

    constructor(
        @InjectRepository(TokensEntity)
        private tokensRepository: Repository<TokensEntity>,
        
        private logsWrite: LogsWriteService
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
    

    async autorisation(token: string, resourcesAccess: ResourcesAccess, 
        logAction: string, mesError: string): Promise<true | HttpException> {
            this.removeOlds()
            if(this.accessToResource(await this.getUserGroups(token), resourcesAccess)) {
                return true
            }
            this.tlogs(token, logAction, LogsTypes.access_denied, `authorization denied to ${resourcesAccess}`)
            throw new HttpException(mesError, HttpStatus.FORBIDDEN)
    }


    async getUserGroups(token: string) {
        const tokenEntity = await this.tokensRepository.createQueryBuilder('tokens')
            .leftJoin('tokens.user', 'user')
            .leftJoin('user.groups', 'groups')
            .select(['tokens.id', 'user.id', 'groups.name'])
            .where({'tokenHash': token})
            .getOne()
        if(!tokenEntity) {
            this.tlogs(token, `auth`, LogsTypes.error, `Token does not exist`)
            throw new HttpException(`Token does not exist`, HttpStatus.BAD_REQUEST)
        }

        return tokenEntity.user.groups.map(g => g.name)
    }


    accessToResource(usersGroups: string[], resourcesAccess: ResourcesAccess): boolean {
        let res: boolean[]
        switch(resourcesAccess) {
            case ResourcesAccess.UsersList: res = AccessUsersList.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.UsersCreate: res = AccessUsersCreate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.UsersUpdate: res = AccessUsersUpdate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.UsersRemove: res = AccessUsersRemove.map(a => usersGroups.includes(a)); break;

            case ResourcesAccess.GroupsList: res = AccessGroupsList.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.GroupsCreate: res = AccessGroupsCreate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.GroupsUpdate: res = AccessGroupsUpdate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.GroupsRemove: res = AccessGroupsRemove.map(a => usersGroups.includes(a)); break;
            
            case ResourcesAccess.LogsList: res = AccessLogsList.map(a => usersGroups.includes(a)); break;
            
            case ResourcesAccess.DevicesList: res = AccessDevicesList.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.DevicesCreate: res = AccessDevicesCreate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.DevicesUpdate: res = AccessDevicesUpdate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.DevicesRemove: res = AccessDevicesRemove.map(a => usersGroups.includes(a)); break;
            
            case ResourcesAccess.ConclsList: res = AccessConclsList.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.ConclsCreate: res = AccessConclsCreate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.ConclsUpdate: res = AccessConclsUpdate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.ConclsRemove: res = AccessConclsRemove.map(a => usersGroups.includes(a)); break;
            
            case ResourcesAccess.CasesList: res = AccessCasesList.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.CasesCreate: res = AccessCasesCreate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.CasesUpdate: res = AccessCasesUpdate.map(a => usersGroups.includes(a)); break;
            case ResourcesAccess.CasesRemove: res = AccessCasesRemove.map(a => usersGroups.includes(a)); break;
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


    async removeToken(tokenHash: string): Promise<DeleteResult> {
        await this.tlogs(tokenHash, `logout`, LogsTypes.success, `token: '${tokenHash}'`)
        return this.tokensRepository.delete({tokenHash})
    }


    async tlogs(tokenHash: string, action: string, type: LogsTypes, data = '') {
        const token: TokensEntity = await this.tokensRepository.findOne({
            relations: ['user'],
            where: {
                tokenHash
            }
        })

        if(token) {
            this.logsWrite.write(token.user.login, action, type, data)
        } else {
            const master = tokenHash === ENVERONMENTS.adminToken ? `enveronments admin` : `unknown`
            tokenHash = tokenHash === ENVERONMENTS.adminToken ? `token enveronments admin` : tokenHash
            this.logsWrite.write(master, action, type, `tokenHash: ${tokenHash}; data: ${data}`)
        }
    }

}