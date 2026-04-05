import { Module } from '@nestjs/common';
import { GenderService } from './services/gender.service';

@Module({
  controllers: [],
  providers: [GenderService],
})
export class GenderModule {}
