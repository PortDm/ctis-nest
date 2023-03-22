import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { ConcsService } from "../conclusions/concs.service";
import { ListsModule } from "../lists/lists.module";
import { PointsController } from "./points.controller";
import { PointsEntity } from "./points.entity";
import { PointsService } from "./points.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PointsEntity]),
        ListsModule,
        TokensModule
    ],
    controllers: [
        PointsController
    ],
    providers: [
        PointsService
    ],
    exports: [PointsService]
})
export class PointsModule { }