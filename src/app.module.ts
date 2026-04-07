import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesBusinessModule } from './module/categories-business/categories-business.module';
import { GenderModule } from './module/gender/gender.module';
import { ProfileModule } from './module/profile/profile.module';
import { UsersModule } from './module/users/users.module';
import { RolesModule } from './module/roles/roles.module';
import { CategoriesProductsModule } from './module/categories-products/categories-products.module';

@Module({
  imports: [
    GenderModule,
    UsersModule,
    ProfileModule,
    CategoriesBusinessModule,
    RolesModule,
    CategoriesBusinessModule,

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
