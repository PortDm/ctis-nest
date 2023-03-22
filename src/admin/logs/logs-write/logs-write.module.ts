import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsEntity } from "../logs.entity";
import { LogsWriteService } from "./logs-write.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([LogsEntity])
    ],
    providers: [
        LogsWriteService
    ],
    exports: [
        LogsWriteService
    ]
})
export class LogsWriteModule { }