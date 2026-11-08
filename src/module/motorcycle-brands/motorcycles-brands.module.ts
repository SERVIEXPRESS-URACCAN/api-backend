import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotorcycleBrand } from './entities/motorcycle-brand.entity';
import { MotorcycleBrandsController } from './controller/motorcycle-brands.controller';
import { MotorcycleBrandsService } from './service/motorcycle-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([MotorcycleBrand])],
  controllers: [MotorcycleBrandsController],
  providers: [MotorcycleBrandsService],
  exports: [MotorcycleBrandsService, TypeOrmModule],
})
export class MotorcycleBrandsModule {}
