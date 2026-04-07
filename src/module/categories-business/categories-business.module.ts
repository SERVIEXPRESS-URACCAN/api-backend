import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesBusinessController } from './controller/categories-business.controller';
import { CategoriesBusiness } from './entities/categories-business.entity';
import { CategoriesBusinessService } from './service/categories-business.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesBusiness])],
=======
import { CategoriesBusinessService } from './categories-business.service';
import { CategoriesBusinessController } from './categories-business.controller';

@Module({
>>>>>>> 278deea (feat: add categories business module with controller, service, and DTOs)
  controllers: [CategoriesBusinessController],
  providers: [CategoriesBusinessService],
})
export class CategoriesBusinessModule {}
