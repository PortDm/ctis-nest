import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENVERONMENTS } from './enveronments';
import { GroupsEntity } from './groups/groups.entity';
import { GroupsModule as GroupsModule } from './groups/groups.module';
import { GroupsService } from './groups/groups.service';
import { LogsEntity } from './logs/logs.entity';
import { LogsModule } from './logs/logs.module';
import { PasswordsEntity } from './passwords/passwords.entity';
import { PasswordsModule } from './passwords/passwords.module';
import { TokensEntity } from './tokens/tokens.entity';
import { TokensModule } from './tokens/tokens.module';
import { UsersCreateDto } from './users/users.dto';
import { UsersEntity } from './users/users.entity';
import { UsersModule } from './users/users.module';
import { UsersCrudService } from './users/users-crud.service';
import { DevicesEntity } from './devices/devices.entity';
import { DevicesModule } from './devices/devices.module';
import { ConcsEntity } from './conclusions/concs.entity';
import { ConcsModule } from './conclusions/concs.module';

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
        UsersEntity,
        PasswordsEntity,
        TokensEntity,
        GroupsEntity,
        LogsEntity,
        DevicesEntity,
        ConcsEntity
      ],
      synchronize: true // false to prod
    }),
    UsersModule,
    PasswordsModule,
    TokensModule,
    GroupsModule,
    LogsModule,
    DevicesModule,
    ConcsModule
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
