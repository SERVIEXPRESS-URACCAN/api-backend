import { Module } from '@nestjs/common';
import { GenderService } from './services/gender.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenderController } from './controller/gender.controller';
import { Gender } from './entities/gender.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gender])],
  controllers: [GenderController],
  providers: [GenderService],
})
export class GenderModule {}
