import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotorcycleModel } from './entities/motorcycle-model.entity';
import { MotorcycleBrand } from '../motorcycle-brand/entities/motorcycle-brand.entity';
import { MotorcycleModelController } from './controller/motorcycle-model.controller';
import { MotorcycleModelService } from './service/motorcycle-model.service';

@Module({
  imports: [TypeOrmModule.forFeature([MotorcycleModel, MotorcycleBrand])],
  controllers: [MotorcycleModelController],
  providers: [MotorcycleModelService],
  exports: [MotorcycleModelService],
})
export class MotorcycleModelModule {}
