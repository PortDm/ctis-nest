import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { PointsModule } from "../points/points.module";
import { DevicesController } from "./devices.controller";
import { DevicesEntity } from "./devices.entity";
import { DevicesService } from "./devices.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([DevicesEntity]),
        TokensModule,
        PointsModule
    ],
    exports: [
        DevicesService
    ],
    controllers: [DevicesController],
    providers: [DevicesService]
})
export class DevicesModule {

}