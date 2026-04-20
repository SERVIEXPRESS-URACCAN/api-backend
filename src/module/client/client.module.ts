import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { ClientController } from './controller/client.controller';
import { ClientService } from './service/client.service';
import { Client } from './entities/client.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, User, Gender])],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
