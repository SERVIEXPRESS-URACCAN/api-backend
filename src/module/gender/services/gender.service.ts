import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../entities/gender.entity';
import { CreateGenderDto } from '../dto/create-gender.dto';
import { UpdateGenderDto } from '../dto/update-gender.dto';

@Injectable()
export class GenderService {
  constructor(
    @InjectRepository(Gender)
    private readonly genderRepo: Repository<Gender>,
  ) {}

  getAll() {
    return this.genderRepo.find();
  }

  getOne(id: number) {
    return this.genderRepo.findOneBy({ id });
  }

  async create(genderDto: CreateGenderDto) {
    try {
      const gender = this.genderRepo.create(genderDto);
      return await this.genderRepo.save(gender);
    } catch (error) {
      console.error('Error creating gender:', error);
    }
  }
  async update(id: number, genderDto: UpdateGenderDto) {
    try {
      const gender = await this.genderRepo.update(id, genderDto);
      if (gender.affected === 0) {
        throw new NotFoundException(`Gender #${id} not found`);
      }
      return this.genderRepo.findOneBy({ id });
    } catch (error) {
      console.error('Error updating gender:', error);
    }
  }
}
