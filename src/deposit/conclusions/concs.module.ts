import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { ConcsController } from "./concs.controller";
import { ConcsEntity } from "./concs.entity";
import { ConcsService } from "./concs.service";
import { ListsModule } from "../lists/lists.module";
import { VolumnsModule } from "../volumns/volumns.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ConcsEntity]),
        TokensModule,
        ListsModule,
        VolumnsModule
    ],
    controllers: [ConcsController],
    providers: [ConcsService]
})
export class ConcsModule {

}