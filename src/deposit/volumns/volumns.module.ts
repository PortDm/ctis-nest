import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsModule } from "src/admin/logs/logs-read/logs-read.module";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { VolumnsEntity } from "./volumns.entity";
import { VolumnsService } from "./volumns.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([VolumnsEntity]),
        TokensModule,
    ],
    controllers: [],
    providers: [VolumnsService],
    exports: [VolumnsService]
})
export class VolumnsModule { }