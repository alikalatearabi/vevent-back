import { Controller, Get, Query, Param, Post, Body, UseGuards, Patch, Delete, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FindProductsDto } from './dto/find-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async findMany(@Query() q: FindProductsDto) {
    return this.productsService.findMany(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Product detail' })
  async findById(@Param('id') id: string) {
    const p = await this.productsService.findById(id);
    return p;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.productsService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id') id: string, @Body() dto: CreateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete product' })
  async remove(@Param('id') id: string) {
    await this.productsService.softDelete(id);
    return { ok: true };
  }
}
