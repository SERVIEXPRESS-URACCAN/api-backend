import { Module } from '@nestjs/common';
import { ProfileController } from './controller/profile.controller';
import { ProfileService } from './service/profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
