import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Roles } from '../roles/entities/roles.entity';
import { Gender } from '../gender/entities/gender.entity';
import { Profile } from '../profile/entities/profile.entity';
import { UsersServiceFind } from './service/users-find.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Roles, Gender, Profile])],
  controllers: [UsersController],
  providers: [UsersService, UsersServiceFind],
  exports: [UsersService, UsersServiceFind],
})
export class UsersModule {}
