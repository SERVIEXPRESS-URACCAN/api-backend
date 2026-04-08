import { Module } from '@nestjs/common';
import { CategoriesProductsController } from './controller/categories-products.controller';
import { CategoriesProductsService } from './service/categories-products.service';

@Module({
  controllers: [CategoriesProductsController],
  providers: [CategoriesProductsService],
})
export class CategoriesProductsModule {}
