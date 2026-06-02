import { Module } from '@nestjs/common';
import { MandaderoService } from './service/mandadero.service';
import { MandaderoController } from './controller/mandadero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mandadero } from './entities/mandadero.entity';
import { User } from '../users/entities/user.entity';
import { MandaderoPolicyService } from './service/mandadero-policy.service';
import { MandaderoStatusService } from './service/mandadero-status.service';

import { MandaderoSolicitudController } from './controller/mandaderoSolicitud/mandadero-solicitud.controller';
import { MandaderoSolicitudService } from './service/MandaderoSolicitud/Mandadero-solicitud.service';
import { Motorcycle } from '../motorcycles/entities/motorcycle.entity';

import { MandaderoAdminController } from './controller/mandaderoSolicitud/mandadero-admin.controller';
import { MandaderoAdminService } from './service/MandaderoSolicitud/mandadero-solicitud-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mandadero, User, Motorcycle])],
  providers: [
    MandaderoService,
    MandaderoStatusService,
    MandaderoPolicyService,
    MandaderoSolicitudService,
    MandaderoAdminService,
  ],
  controllers: [
    MandaderoController,
    MandaderoSolicitudController,
    MandaderoAdminController,
  ],
})
export class MandaderoModule {}
