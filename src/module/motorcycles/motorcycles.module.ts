import { Module } from '@nestjs/common';
import { MotorcyclesService } from './service/motorcycles.service';
import { MotorcyclesController } from './controller/motorcycles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motorcycle } from './entities/motorcycle.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { MotorcycleModel } from '../motorcycle-model/entities/motorcycle-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Motorcycle, Mandadero, MotorcycleModel])],
  controllers: [MotorcyclesController],
  providers: [MotorcyclesService],
})
export class MotorcyclesModule {}
