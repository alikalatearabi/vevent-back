import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @ApiProperty({ example: 'electronics', description: 'Category name (unique)' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Electronics & Technology', description: 'Display title' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Electronic devices and technology products', description: 'Category description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '#3B82F6', description: 'Color code for frontend display' })
  color?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'fas fa-laptop', description: 'Icon class or name' })
  icon?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent category ID for nested categories' })
  parentId?: string;
}
