import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { BusinessModule } from './module/business/business.module';
import { CategoriesBusinessModule } from './module/categories-business/categories-business.module';
import { CategoriesProductsModule } from './module/categories-products/categories-products.module';
import { CityModule } from './module/city/city.module';
import { GenderModule } from './module/gender/gender.module';
import { MandaderoModule } from './module/mandadero/mandadero.module';
import { MotorcyclesModule } from './module/motorcycles/motorcycles.module';
import { OwnerModule } from './module/owner/owner.module';
import { ProfileModule } from './module/profie/profile.module';
import { RolesModule } from './module/roles/roles.module';
import { UsersModule } from './module/users/users.module';
import { UserRolesModule } from './module/user-roles/user-roles.module';
import { ProductsModule } from './module/products/products.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
