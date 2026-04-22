import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-roles.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../roles/entities/roles.entity';
import { UserRolesController } from './controller/user-roles.controller';
import { UserRolesService } from './service/user-roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Roles])],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
