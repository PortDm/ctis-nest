import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConcsController } from "./concs.controller";
import { ConcsService } from "./concs.service";

@Module({
    imports: [TypeOrmModule.forFeature()],
    controllers: [ConcsController],
    providers: [ConcsService],
    exports: [ConcsService]
})
export class ConcsModule {

}