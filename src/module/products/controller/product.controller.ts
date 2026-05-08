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
import { CreateProductDto } from '../dto/porducts.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { ProductService } from '../service/products.service';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { UpdateProductAdminDto } from '../dto/updateProductAdmin.dto';
import { ProductAdminService } from '../service/productsAdmin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { validateFile } from 'src/common/helper/validationFiles.helper';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductService,
    private readonly productsAdminService: ProductAdminService,
  ) {}

  @Get('admin')
  @Auth('admin')
  findAllByAdmin() {
    return this.productsAdminService.findAllByAdmin();
  }

  @Get('admin/:id')
  @Auth('admin')
  findOneByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.productsAdminService.findOneByAdmin(id);
  }

  @Post('admin')
  @Auth('admin')
  createByAdmin(@Body() createProductAdminDto: CreateProductAdmin) {
    return this.productsAdminService.createByAdmin(createProductAdminDto);
  }

  @Patch('admin/:id')
  @Auth('admin')
  updateByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductAdminDto: UpdateProductAdminDto,
  ) {
    return this.productsAdminService.updateByAdmin(id, updateProductAdminDto);
  }

  @Delete('admin/:id')
  @Auth('admin')
  removeByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.productsAdminService.removeByAdmin(id);
  }

  @Post()
  @Auth('owner')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: AuthUser,
  ) {
    validateFile({ image: file });
    return this.productsService.create(createProductDto, file, user);
  }

  @Get()
  @Auth('owner')
  findAll(
    @GetUser() user: AuthUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productsService.findAllByOwner(
      user,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @Auth('owner')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.productsService.findOne(id, user);
  }

  @Patch(':id')
  @Auth('owner')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: AuthUser,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth('owner')
  removeByOwner(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AuthUser,
  ) {
    return this.productsService.removeByOwner(id, user);
  }
}
