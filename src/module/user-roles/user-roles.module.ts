import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoles } from './entities/user-roles.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../roles/entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoles, User, Roles])],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserRolesModule {}
