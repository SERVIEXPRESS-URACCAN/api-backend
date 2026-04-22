import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityController } from './controller/city.controller';
import { City } from './entities/city.entity';
import { CityService } from './service/city.service';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
