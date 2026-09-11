import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { BusinessModule } from './module/business/business.module';
import { CartItemsModule } from './module/cart-items/cart-items.module';
import { CartModule } from './module/cart/cart.module';
import { CategoriesBusinessModule } from './module/categories-business/categories-business.module';
import { CategoriesProductsModule } from './module/categories-products/categories-products.module';
import { CityModule } from './module/city/city.module';
import { GenderModule } from './module/gender/gender.module';
import { MandaderoModule } from './module/mandadero/mandadero.module';
import { MotorcyclesModule } from './module/motorcycles/motorcycles.module';
import { OrderModule } from './module/order/order.module';
import { OwnerModule } from './module/owner/owner.module';
import { ProductsModule } from './module/products/products.module';
import { ProfileModule } from './module/profile/profile.module';
import { RolesModule } from './module/roles/roles.module';
import { UserRolesModule } from './module/user-roles/user-roles.module';
import { UsersModule } from './module/users/users.module';
import { OrderItemsModule } from './module/order-items/order-items.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MotorcycleModelModule } from './module/motorcycle-model/motorcycle-model.module';
import { MotorcycleBrandModule } from './module/motorcycle-brand/motorcycle-brand.module';

@Module({
  imports: [
    GenderModule,
    UsersModule,
    RolesModule,
    CategoriesBusinessModule,
    RolesModule,
    CategoriesBusinessModule,
    AuthModule,
    ProfileModule,
    UserRolesModule,
    ProductsModule,
    MotorcycleBrandModule,
    MotorcycleModelModule,
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: Number.parseInt(configService.get('DB_PORT') || '5432'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),

        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    CategoriesProductsModule,
    MandaderoModule,
    MotorcyclesModule,
    OwnerModule,
    CityModule,
    BusinessModule,
    CartModule,
    CartItemsModule,
    OrderModule,
    OrderItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
