import { Module } from '@nestjs/common';
import { MandaderoService } from './service/mandadero.service';
import { MandaderoController } from './controller/mandadero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mandadero } from './entities/mandadero.entity';
import { User } from '../users/entities/user.entity';
import { MandaderoPolicyService } from './service/mandadero-policy.service';
import { MandaderoStatusService } from './service/mandadero-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mandadero, User])],
  providers: [MandaderoService, MandaderoStatusService, MandaderoPolicyService],
  controllers: [MandaderoController],
})
export class MandaderoModule {}
