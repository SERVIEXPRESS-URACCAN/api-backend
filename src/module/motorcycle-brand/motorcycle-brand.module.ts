import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotorcycleBrand } from './entities/motorcycle-brand.entity';
import { MotorcycleBrandController } from './controller/motorcycle-brand.controller';
import { MotorcycleBrandService } from './service/motorcycle-brand.service';

@Module({
  imports: [TypeOrmModule.forFeature([MotorcycleBrand])],
  controllers: [MotorcycleBrandController],
  providers: [MotorcycleBrandService],
  exports: [MotorcycleBrandService],
})
export class MotorcycleBrandModule {}
