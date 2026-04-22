import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { BusinessService } from '../service/business.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async create(@Body() createBusinessDto: CreateBusinessDto) {
    const business = await this.businessService.create(createBusinessDto);

    return {
      data: business,
      message: 'Business creado con éxito',
    };
  }

  @Get()
  findAll() {
    return this.businessService.findAll();
  }

  // @Get(':id')
  // getOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.businessService.getOne(id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessService.update(+id, updateBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.remove(+id);
  }
}
