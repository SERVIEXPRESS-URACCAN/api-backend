import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/module/users/entities/user.entity';
import { OwnerController } from './controller/owner.controller';
import { Owner } from './entities/owner.entity';
import { OwnerService } from './service/owner.service';
import { Roles } from '../roles/entities/roles.entity';
import { OwnerSolicitudService } from './service/owner-solicitud.service';

@Module({
  imports: [TypeOrmModule.forFeature([Owner, User, Roles])],
  controllers: [OwnerController],
  providers: [OwnerService, OwnerSolicitudService],
})
export class OwnerModule {}
