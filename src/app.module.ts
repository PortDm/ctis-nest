import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENVERONMENTS } from './enveronments';
import { GroupsEntity } from './admin/groups/groups.entity';
import { GroupsModule } from './admin/groups/groups.module';
import { GroupsService } from './admin/groups/groups.service';
import { LogsEntity } from './admin/logs/logs.entity';
import { PasswordsEntity } from './admin/passwords/passwords.entity';
import { TokensEntity } from './admin/tokens/tokens.entity';
import { UsersEntity } from './admin/users/users.entity';
import { UsersModule } from './admin/users/users.module';
import { UsersCrudService } from './admin/users/users-crud.service';
import { DevicesEntity } from './deposit/devices/devices.entity';
import { ConcsEntity } from './deposit/conclusions/concs.entity';
import { YearsEntity } from './deposit/years/years.entity';
import { CasesEntity } from './deposit/cases/cases.entity';
import { VolumnsEntity } from './deposit/volumns/volumns.entity';
import { ListsEntity } from './deposit/lists/lists.entity';
import { PointsEntity } from './deposit/points/points.entity';
import { LogsModule } from './admin/logs/logs-read/logs-read.module';
import { DepositModule } from './deposit/deposit.module';
import { ConcsModule } from './deposit/conclusions/concs.module';
import { DevicesModule } from './deposit/devices/devices.module';
import { PointsModule } from './deposit/points/points.module';

// create database ctis lc_collate="ru_RU.utf-8" lc_ctype="ru_RU.utf-8" template=template0;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1',
      database: 'ctis',
      entities: [
        GroupsEntity,
        UsersEntity,
        PasswordsEntity,
        TokensEntity,
        LogsEntity,
        DevicesEntity,
        ConcsEntity,
        YearsEntity,
        CasesEntity,
        VolumnsEntity,
        ListsEntity,
        PointsEntity
      ],
      synchronize: true // false to prod
    }),
    UsersModule,
    GroupsModule,
    LogsModule,
    ConcsModule,
    DevicesModule,
    DepositModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  constructor(
    private groupsService: GroupsService,
    private usersService: UsersCrudService
  ) { 

    const admin = {
      "lastName": "Portnykh",
      "firstName": "Dmitry",
      "middleName": "Viktorovich",
      "dep": "Development",
      "post": "Main engineer",
      "rank": "Major",
      "login": "Demo",
      "passwordAES": "U2FsdGVkX19ycx54NuJay9vjP4Q1vdV+cRIdThNL3EQ=", // 1234
      "birth": "1984-12-09",
      "adminToken": ENVERONMENTS.adminToken
    }
      
    groupsService.create({name: 'Administrators'}, ENVERONMENTS.adminToken)
      .then((createdGroup: GroupsEntity) => {
        if(createdGroup) {
          console.log('group "Administrators" has been created')
        }

        return usersService.create(
          {...admin, groupsIds: [createdGroup.id]}, ENVERONMENTS.adminToken)
      }).then((res) => {
        if(res) {
          console.log('user "Demo" has been created')
        }
      }).catch(() => {})
  }

}




