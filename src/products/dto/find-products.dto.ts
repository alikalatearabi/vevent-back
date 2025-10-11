import { IsOptional, IsString, IsInt, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search query for product name or description', example: 'laptop' })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by exhibitor id', example: 'exhibitor-uuid' })
  exhibitorId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by category ID', example: 'category-uuid' })
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiPropertyOptional({ description: 'Filter by in stock status', example: true })
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiPropertyOptional({ description: 'Filter by featured status', example: true })
  featured?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by tag IDs (comma-separated)', example: 'tag1,tag2' })
  tags?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Minimum price filter', example: 100 })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Maximum price filter', example: 1000 })
  maxPrice?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Sort by field', example: 'name', enum: ['name', 'price', 'createdAt', 'featured'] })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Sort order', example: 'desc', enum: ['asc', 'desc'] })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
