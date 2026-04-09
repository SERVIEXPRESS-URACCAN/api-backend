import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MandaderoService } from '../service/mandadero.service';
import { CreateMandaderoDto } from '../dto/create-mandadero.dto';

@Controller('mandadero')
export class MandaderoController {
  constructor(private readonly MandaderoService: MandaderoService) {}

  @Patch('user/:userId')
  async changeStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('available') available: boolean,
  ) {
    return this.MandaderoService.changeStatusByUser(userId, available);
  }

  @Post()
  async create(@Body() createMandaderoDto: CreateMandaderoDto) {
    const mandadero = await this.MandaderoService.create({
      ...createMandaderoDto,
      user: createMandaderoDto.user,
    });

    return {
      data: mandadero,
      message: 'Mandadero creado con exito',
    };
  }

  @Get()
  findAll() {
    return this.MandaderoService.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.MandaderoService.findOne(id);
  }
}
