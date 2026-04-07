import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesBusinessController } from './controller/categories-business.controller';
import { CategoriesBusiness } from './entities/categories-business.entity';
import { CategoriesBusinessService } from './service/categories-business.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesBusiness])],
  controllers: [CategoriesBusinessController],
  providers: [CategoriesBusinessService],
})
export class CategoriesBusinessModule {}
