import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { MandaderoService } from '../service/mandadero.service';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { FilterMandaderoDto } from '../dto/mandadero-filter.dto';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { Auth } from 'src/module/auth/decorator/auth.decorator';

@Controller('mandadero')
export class MandaderoController {
  constructor(private readonly mandaderoService: MandaderoService) {}

  @Get('me')
  @Auth('mandadero')
  getMyMandadero(@GetUser() user: AuthUser) {
    return this.mandaderoService.findMine(user);
  }

  @Patch(':id/availability')
  @Auth('admin', 'mandadero')
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { available: boolean },
  ) {
    return this.mandaderoService.updateAvailabilityById(id, body.available);
  }

  @Patch(':id/activate')
  @Auth('admin')
  activate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.mandaderoService.updateActive(id, body.isActive);
  }

  @Get()
  @Auth('admin')
  findAll(@Query() query: FilterMandaderoDto) {
    return this.mandaderoService.findAll(query);
  }
  @Get(':id')
  @Auth('admin')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.mandaderoService.findOne(id, user);
  }
  @Patch(':id/approve')
  @Auth('admin')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.mandaderoService.approve(id);
  }

  @Patch(':id/reject')
  @Auth('admin')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.mandaderoService.reject(id);
  }
}
