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
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { CatalogProductsDto } from '../dto/catalog-products';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';
import { CreateProductDto } from '../dto/products.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { UpdateProductAdminDto } from '../dto/updateProductAdmin.dto';
import { ProductService } from '../service/products.service';
import { ProductAdminService } from '../service/productsAdmin.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductService,
    private readonly productsAdminService: ProductAdminService,
  ) {}

  @Get('admin')
  @Auth('admin')
  findAllByAdmin(
    @Query() paginationDto: PaginationDto,
    @Query('businessId') businessId?: number,
  ) {
    return this.productsAdminService.findAllByAdmin(paginationDto, businessId);
  }

  @Get('admin/:id')
  @Auth('admin')
  findOneByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.productsAdminService.findOneByAdmin(id);
  }

  @Auth('client')
  @Get('catalog')
  findAllForCatalog(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    query: CatalogProductsDto,
  ) {
    return this.productsService.findAllForCatalog(query);
  }

  @Post('admin')
  @Auth('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',

        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;

          cb(null, uniqueName);
        },
      }),
    }),
  )
  createByAdmin(
    @Body() createProductAdminDto: CreateProductAdmin,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsAdminService.createByAdmin(createProductAdminDto, file);
  }

  @Patch('admin/:id')
  @Auth('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',

        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;

          cb(null, uniqueName);
        },
      }),
    }),
  )
  updateByAdmin(
    @Param('id', ParseIntPipe) id: number,

    @Body() updateProductAdminDto: UpdateProductAdminDto,

    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsAdminService.updateByAdmin(
      id,
      updateProductAdminDto,
      file,
    );
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
        destination: './uploads/products',

        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;

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
    return this.productsService.create(createProductDto, file, user);
  }

  @Get()
  @Auth('owner')
  findAll(@GetUser() user: AuthUser, @Query() paginationDto: PaginationDto) {
    return this.productsService.findAllByOwner(user, paginationDto);
  }

  @Get(':id')
  @Auth('owner')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.productsService.findOne(id, user);
  }

  @Patch(':id')
  @Auth('owner')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',

        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;

          cb(null, uniqueName);
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateProductDto,
    @GetUser() user: AuthUser,
  ) {
    return this.productsService.update(id, dto, file, user);
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
