import { Module } from '@nestjs/common';
import { MandaderoService } from './service/mandadero.service';
import { MandaderoController } from './controller/mandadero.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mandadero } from './entities/mandadero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mandadero])],
  providers: [MandaderoService],
  controllers: [MandaderoController],
})
export class MandaderoModule {}
