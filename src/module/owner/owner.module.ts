import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/module/users/entities/user.entity';
import { OwnerController } from './controller/owner.controller';
import { Owner } from './entities/owner.entity';
import { OwnerService } from './service/owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Owner, User])],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
