import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ENVERONMENTS, ResoursesAccess } from "src/enveronments";
import { LogsTypes } from "src/logs/logs.dto";
import { LogsService } from "src/logs/logs.service";
import { PasswordsService } from "src/passwords/passwords.service";
import { TokensService } from "src/tokens/tokens.service";
import { Raw, Repository } from "typeorm";
import { LoginResponce } from "./users.dto";
import { UsersEntity } from "./users.entity";

const CryptoJS = require('crypto-js')

@Injectable()
export class UsersLoginService {
    constructor(
        @InjectRepository(UsersEntity)
        private usersRepository: Repository<UsersEntity>,

        private tokensService: TokensService,
        private passwordsService: PasswordsService,
        private logs: LogsService
    ) { }

    async getOneByLogin(login: string, token: string): Promise<UsersEntity> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersList)
        if(!isAutorisation) {
            throw new HttpException("Don't have access to users list", HttpStatus.FORBIDDEN)
        }

        return this.usersRepository.findOne({
            relations: ['passAESOlds', 'groups'],
            where: {
                login: Raw((alias) => `LOWER(${alias}) = '${login.toLowerCase()}'`)
            }
        })
    }

    async getByLogin(login: string, token: string): Promise<UsersEntity[]> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersList)
        if(!isAutorisation) {
            throw new HttpException("Don't have access to users list", HttpStatus.FORBIDDEN)
        }

        return this.usersRepository.find({
            relations: ['passAESOlds'],
            where: {
                login: Raw((alias) => `LOWER(${alias}) = '${login.toLowerCase()}'`)
            }
        })
    }

    async isAccessToCreate(token: string): Promise<boolean | HttpException> {
        const isAutorisation = await this.tokensService.autorisation(token, ResoursesAccess.UsersCreate)
        if(!isAutorisation) {
            this.logs.write(token, 'access to create users', LogsTypes.access_denied)
            throw new HttpException("Don't have access to create users", HttpStatus.FORBIDDEN)
        }

        this.logs.write(token, 'access to create users', LogsTypes.success)
        return true
    }

    async login(login: string, passAES: string): Promise<LoginResponce | null> {
        const user =  await this.getOneByLogin(login, ENVERONMENTS.adminToken)
        const isPassAESUsed = user?.passAESOlds.find(p => p.passAES === passAES)
        if(isPassAESUsed) {
            this.logs.write('', 'logining', LogsTypes.access_denied, `pass is old (${login})`)
            return null
        }

        const hash = this.dectyptAndHash(passAES, login)
        const authRes = user?.passwordHash === hash
        let userGroups = []
        user.groups.map(g => userGroups.push(g.name))
        if(authRes) {
            this.passwordsService.removePassOlds(user.passAESOlds)
            this.passwordsService.create({user, passAES})
            const token = await this.tokensService.create(user)
            delete token.user
            this.logs.write('', 'logining', LogsTypes.success, `'${login}'`)
            return {
                ...token,
                userName: `${user.firstName} ${user.middleName}`,
                userGroups: userGroups
            }
        }
        this.logs.write('', 'logining', LogsTypes.access_denied, `Bad login or pass (${login})`)
        return null
    }

    dectyptAndHash(encrypt: string, secretKey: string): string {
        try {
            const passwordStr = CryptoJS.AES.decrypt(encrypt, secretKey + ENVERONMENTS.passkey).toString(CryptoJS.enc.Utf8)
            const hash = CryptoJS.HmacSHA1(passwordStr, secretKey).toString()
            // console.log('pass', passwordStr, '| secretKey', secretKey, '| hash', hash)
            return hash
        }
        catch {
            return ''
        }
    }


    AESPass(loginAndPass: {login: string, passStr: string}) {
        // console.log(CryptoJS.HmacSHA1("minin2@mail.com", "1234").toString());
        // console.log(CryptoJS.HmacSHA1("1234", "minin@mail.com").toString());
        // console.log(CryptoJS.HmacSHA1("minin@mail.com", "1234").toString());

        // var ciphertext = CryptoJS.AES.encrypt('my message dfdsf sd sdf sdsdf dsf', 'secret key').toString()
        // console.log('crypto text: ', ciphertext)
        // var bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key')
        // console.log('bytes: ', bytes)
        // var originalText = bytes.toString(CryptoJS.enc.Utf8)
        // console.log('original text: ', originalText)

        return {
            login: loginAndPass.login,
            passStr: loginAndPass.passStr,
            passAES: CryptoJS.AES.encrypt(loginAndPass.passStr, loginAndPass.login + ENVERONMENTS.passkey).toString()
        }
        
    }
}