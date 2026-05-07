import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from '../business/business.module';
import { Business } from '../business/entities/business.entity';
import { CategoriesProduct } from '../categories-products/entities/categories-product.entity';
import { ProductsController } from './controller/product.controller';
import { Product } from './entities/products.entity';
import { ProductService } from './service/products.service';
import { ProductAdminService } from './service/productsAdmin.service';
import { ProductSharedService } from './service/productsShared.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, CategoriesProduct, Business]),
    BusinessModule,
  ],
  controllers: [ProductsController],
  providers: [ProductService, ProductAdminService, ProductSharedService],
  exports: [ProductSharedService],
})
export class ProductsModule {}
