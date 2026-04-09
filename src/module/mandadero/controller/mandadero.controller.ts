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

  @Patch(':id')
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { available: boolean },
  ) {
    return this.MandaderoService.updateAvailability(id, body.available);
  }

  @Patch(':id/activate')
  activate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.MandaderoService.updateActive(id, body.isActive);
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
