import { Module } from '@nestjs/common';
import { MotorcyclesService } from './service/motorcycles.service';
import { MotorcyclesController } from './controller/motorcycles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motorcycle } from './entities/motorcycle.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Motorcycle, Mandadero])],
  controllers: [MotorcyclesController],
  providers: [MotorcyclesService],
})
export class MotorcyclesModule {}
