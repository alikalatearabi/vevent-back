import { IsString, IsOptional, IsArray, IsNumberString, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'Gaming Laptop', description: 'Product name' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Premium Gaming Laptop Pro', description: 'Display title' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'High-performance laptop with RGB keyboard and advanced cooling system' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'High-performance laptop for gaming and work', description: 'Short description for product cards' })
  shortDescription?: string;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: 'Price as decimal string, e.g. 1299.99', example: '1299.99' })
  price?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://example.com/laptop.jpg', description: 'Primary image URL (for backward compatibility)' })
  imageUrl?: string;

  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'Exhibitor id', example: 'cl0x1234abcd' })
  exhibitorId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Category id', example: 'cat-electronics-123' })
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiPropertyOptional({ description: 'Product in stock status', example: true, default: true })
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiPropertyOptional({ description: 'Featured product status', example: false, default: false })
  featured?: boolean;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [String], description: 'Array of existing asset ids to link', example: ['assetId1', 'assetId2'] })
  assets?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  @ApiPropertyOptional({ type: [String], description: 'Array of tag IDs to associate with product', example: ['tagId1', 'tagId2'] })
  tagIds?: string[];

  @IsOptional()
  @ApiPropertyOptional({ description: 'Arbitrary JSON metadata', type: 'object', example: { color: 'red', size: 'L' } })
  metadata?: any;
}
