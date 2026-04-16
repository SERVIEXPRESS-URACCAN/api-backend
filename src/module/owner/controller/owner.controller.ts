import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { OwnerService } from '../service/owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  async create(@Body() createOwnerDto: CreateOwnerDto) {
    const owner = await this.ownerService.create(createOwnerDto);

    return {
      data: owner,
      message: 'Owner creado con exito',
    };
  }

  @Get()
  findAll() {
    return this.ownerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ownerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return this.ownerService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  Delete(@Param('id', ParseIntPipe) id: number) {
    return this.ownerService.remove(id);
  }
}
