import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { User } from 'src/module/users/entities/user.entity';
import { OwnerController } from './controller/owner.controller';
import { Owner } from './entities/owner.entity';
import { OwnerService } from './service/owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Owner, User, Gender])],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
