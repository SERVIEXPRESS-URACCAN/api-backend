import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesProductsController } from './controller/categories-products.controller';
import { CategoriesProduct } from './entities/categories-product.entity';
import { CategoriesProductsService } from './service/categories-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesProduct])],
  controllers: [CategoriesProductsController],
  providers: [CategoriesProductsService],
})
export class CategoriesProductsModule {}
