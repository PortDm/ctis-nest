import { Module } from "@nestjs/common";
import { TokensModule } from "src/admin/tokens/tokens.module";
import { CasesModule } from "./cases/cases.module";
import { ConcsModule } from "./conclusions/concs.module";
import { DepositController } from "./deposit.controller";
import { DepositService } from "./deposit.service";
import { DevicesModule } from "./devices/devices.module";
import { ListsModule } from "./lists/lists.module";
import { PointsModule } from "./points/points.module";
import { VolumnsModule } from "./volumns/volumns.module";
import { YearsModule } from "./years/years.module";

@Module({
    imports: [
        // DevicesModule,
        // PointsModule,
        // ListsModule,
        // ConcsModule,
        VolumnsModule,
        CasesModule,
        YearsModule,
        TokensModule
    ],
    controllers: [
        DepositController
    ],
    providers: [
        DepositService
    ]
})
export class DepositModule { }