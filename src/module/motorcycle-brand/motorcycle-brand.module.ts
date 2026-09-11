import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotorcycleBrand } from './entities/motorcycle-brand.entity';

import { MotorcycleBrandService } from './service/motorcycle-brand.service';
import { MotorcycleBrandController } from './controller/motorcycle-brand.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MotorcycleBrand])],
  controllers: [MotorcycleBrandController],
  providers: [MotorcycleBrandService],
  exports: [MotorcycleBrandService],
})
export class MotorcycleBrandModule {}
