import { Controller, Get, Param } from "@nestjs/common";
import { ResoursesAccess } from "src/enveronments";
import { TokensEntity } from "./tokens.entity";
import { TokensService } from "./tokens.service";

@Controller('tokens')
export class TokenContorller {
    constructor(private tokensService: TokensService) {}

    @Get()
    getAll(): Promise<TokensEntity[]> {
        return this.tokensService.getAll()
    }

    // @Get('create')
    // create(): Promise<TokensEntity> {
    //     return this.tokensService.create()
    // }

    @Get('autorisation/:tokenHash')
    autorisation(@Param('tokenHash') tokenHash: string): Promise<boolean> {
        return this.tokensService.autorisation(tokenHash, ResoursesAccess.UsersList)
    }

    @Get('removeolds')
    removeOlds(): Promise<TokensEntity[]> {
        return this.tokensService.removeOlds()
    }

    @Get('isValidToken/:tokenHash')
    isValidToken(@Param('tokenHash') tokenHash: string): Promise<TokensEntity> {
        return this.tokensService.isValidToken(tokenHash)
    }
     
}