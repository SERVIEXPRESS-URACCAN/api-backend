import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesBusiness } from '../categories-business/entities/categories-business.entity';
import { BusinessController } from './controller/business.controller';
import { Business } from './entities/business.entity';
import { BusinessService } from './service/business.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business, CategoriesBusiness])],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
