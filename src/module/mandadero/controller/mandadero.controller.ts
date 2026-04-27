import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MandaderoService } from '../service/mandadero.service';
import { CreateMandaderoDto } from '../dto/create-mandadero.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  @Patch('me')
  @Auth('mandadero')
  updateMyAvailability(
    @GetUser() user: AuthUser,
    @Body() body: { available: boolean },
  ) {
    return this.mandaderoService.updateMyAvailability(body.available, user);
  }
  @Post()
  @Auth('admin', 'client')
  @UseInterceptors(
    FileInterceptor('imageIdentification', {
      storage: diskStorage({
        destination: './uploads/mandaderos',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body() body: CreateMandaderoDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: AuthUser,
  ) {
    return this.mandaderoService.create(body, file, user);
  }

  @Patch(':id/availability')
  @Auth('admin')
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
  @Delete(':id')
  @Auth('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mandaderoService.remove(id);
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
