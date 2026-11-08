import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MotorcyclesService } from './service/motorcycles.service';
import { MotorcyclesController } from './controller/motorcycles.controller';
import { Motorcycle } from './entities/motorcycle.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { MotorcycleBrandsModule } from '../motorcycle-brands/motorcycles-brands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Motorcycle, Mandadero]),
    MotorcycleBrandsModule,
  ],
  controllers: [MotorcyclesController],
  providers: [MotorcyclesService],
})
export class MotorcyclesModule {}
