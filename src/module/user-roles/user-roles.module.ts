import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-roles.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../roles/entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Roles])],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserRolesModule {}
