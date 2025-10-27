import { Controller, Get, Query, Param, Post, Body, UseGuards, Patch, Delete, Req, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FindProductsDto } from './dto/find-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetService } from '../common/services/asset.service';

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly assetService: AssetService,
  ) {}

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

  // Image upload endpoints
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(':id/images')
  @ApiOperation({ summary: 'Upload product images' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async uploadImages(
    @Param('id') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const userId = req.user?.sub;
    const uploadedAssets = [];

    for (const file of files) {
      // Validate image file
      this.assetService.validateImageFile(file);

      // Upload to MinIO and create asset record
      const asset = await this.assetService.createAsset(
        file,
        `products/${productId}`,
        userId,
        { productId },
      );

      // Link asset to product
      const link = await this.assetService.linkAssetToProduct(
        asset.id,
        productId,
        'gallery', // Default role
      );

      uploadedAssets.push({
        id: asset.id,
        url: asset.url,
        role: link.role,
        originalName: file.originalname,
      });
    }

    return {
      message: `${uploadedAssets.length} images uploaded successfully`,
      assets: uploadedAssets,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(':id/images/cover')
  @ApiOperation({ summary: 'Upload product cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Cover image uploaded successfully' })
  @UseInterceptors(FilesInterceptor('image', 1)) // Single cover image
  async uploadCoverImage(
    @Param('id') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }

    const file = files[0];
    const userId = req.user?.sub;

    // Validate image file
    this.assetService.validateImageFile(file);

    // Remove existing cover image
    const existingCovers = await this.assetService.getProductAssets(productId);
    for (const cover of existingCovers.filter(a => a.role === 'cover')) {
      await this.assetService.unlinkAssetFromProduct(cover.assetId, productId);
      await this.assetService.deleteAsset(cover.assetId);
    }

    // Upload new cover image
    const asset = await this.assetService.createAsset(
      file,
      `products/${productId}`,
      userId,
      { productId },
    );

    // Link as cover
    const link = await this.assetService.linkAssetToProduct(
      asset.id,
      productId,
      'cover',
    );

    return {
      message: 'Cover image uploaded successfully',
      asset: {
        id: asset.id,
        url: asset.url,
        role: link.role,
        originalName: file.originalname,
      },
    };
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Get product images' })
  @ApiResponse({ status: 200, description: 'Product images retrieved successfully' })
  async getImages(@Param('id') productId: string) {
    const assets = await this.assetService.getProductAssets(productId);
    
    return {
      productId,
      images: assets.map(a => ({
        id: a.asset.id,
        url: a.asset.url,
        role: a.role,
        type: a.asset.type,
        meta: a.asset.meta,
        createdAt: a.asset.createdAt,
      })),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id/images/:assetId')
  @ApiOperation({ summary: 'Delete product image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteImage(
    @Param('id') productId: string,
    @Param('assetId') assetId: string,
  ) {
    // Unlink from product
    await this.assetService.unlinkAssetFromProduct(assetId, productId);
    
    // Delete asset
    await this.assetService.deleteAsset(assetId);

    return {
      message: 'Image deleted successfully',
    };
  }
}
