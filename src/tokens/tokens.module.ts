import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenContorller } from "./tokens.controller";
import { TokensEntity } from "./tokens.entity";
import { TokensService } from "./tokens.service";

@Module({
    imports: [TypeOrmModule.forFeature([TokensEntity])],
    controllers: [TokenContorller],
    providers: [TokensService],
    exports: [TokensService]
})
export class TokensModule {

}