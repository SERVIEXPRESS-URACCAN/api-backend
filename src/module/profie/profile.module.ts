import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { ProfileController } from './controller/profile.controller';
import { ProfileService } from './service/profile.service';
import { Profile } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User, Gender])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
