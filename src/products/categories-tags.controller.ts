import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { TagsService } from './tags.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';

@ApiTags('Categories & Tags')
@Controller('api/v1')
export class CategoriesTagsController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  // Categories endpoints
  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    const categories = await this.categoriesService.findAll();
    return {
      data: categories,
      meta: { total: categories.length }
    };
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('categories')
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() dto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.delete(id);
    return { message: 'Category deleted successfully' };
  }

  // Tags endpoints
  @Get('tags')
  @ApiOperation({ summary: 'List all tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getTags() {
    const tags = await this.tagsService.findAll();
    return {
      data: tags,
      meta: { total: tags.length }
    };
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  async getTagById(@Param('id') id: string) {
    return this.tagsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('tags')
  @ApiOperation({ summary: 'Create new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  async createTag(@Body() dto: CreateTagDto, @Req() req: any) {
    return this.tagsService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch('tags/:id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  async updateTag(@Param('id') id: string, @Body() dto: CreateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  async deleteTag(@Param('id') id: string) {
    await this.tagsService.delete(id);
    return { message: 'Tag deleted successfully' };
  }
}
