import { Module } from "@nestjs/common";
import { LogsModule } from "./admin/logs/logs-read/logs-read.module";
import { TokensModule } from "./admin/tokens/tokens.module";

@Module({
    imports:[
        TokensModule,
        LogsModule
    ],
    exports: [
        TokensModule,
        LogsModule
    ]
})
export class ShareModule { }