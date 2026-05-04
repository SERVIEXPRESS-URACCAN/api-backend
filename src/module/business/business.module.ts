import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesBusiness } from '../categories-business/entities/categories-business.entity';
import { City } from '../city/entities/city.entity';
import { Owner } from '../owner/entities/owner.entity';
import { BusinessController } from './controller/business.controller';
import { Business } from './entities/business.entity';
import { BusinessImageService } from './service/business-image.service';
import { BusinessRelationsService } from './service/business-relations.service';
import { BusinessService } from './service/business.service';
import { FileService } from './service/file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, CategoriesBusiness, Owner, City]),
  ],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    FileService,
    BusinessImageService,
    BusinessRelationsService,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
