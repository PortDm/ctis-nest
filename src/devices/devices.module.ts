import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConcsService } from "src/conclusions/concs.service";
import { TokensModule } from "src/tokens/tokens.module";
import { DevicesController } from "./devices.controller";
import { DevicesService } from "./devices.service";

@Module({
    imports: [
        TypeOrmModule.forFeature(),
        TokensModule,
        ConcsService
    ],
    controllers: [DevicesController],
    providers: [DevicesService]
})
export class DevicesModule {

}