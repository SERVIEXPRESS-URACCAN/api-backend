import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../entities/gender.entity';
import { CreateGenderDto } from '../dto/create-gender.dto';
import { UpdateGenderDto } from '../dto/update-gender.dto';

@Injectable()
export class GenderService {
  genderRepository: any;
  constructor(
    @InjectRepository(Gender)
    private genderRepo: Repository<Gender>,
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
      const gender = await this.genderRepo.findOneBy({ id });
      if (!gender) {
        throw new Error('Gender not found');
      }
      const updatedGender = this.genderRepo.merge(gender, genderDto);
      console.log(genderDto);
      return await this.genderRepo.save(updatedGender);
    } catch (error) {
      console.error('Error updating gender:', error);
    }
  }
  async delete(id: number) {
    return this.genderRepo.delete(id);
  }
}
