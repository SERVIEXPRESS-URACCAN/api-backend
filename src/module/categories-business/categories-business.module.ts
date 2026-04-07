import { Module } from '@nestjs/common';
import { CategoriesBusinessService } from './categories-business.service';
import { CategoriesBusinessController } from './categories-business.controller';

@Module({
  controllers: [CategoriesBusinessController],
  providers: [CategoriesBusinessService],
})
export class CategoriesBusinessModule {}
