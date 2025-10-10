import { IsString, IsOptional, IsArray, IsNumberString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'Event T-Shirt', description: 'Product name' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Comfortable cotton t-shirt with event logo' })
  description?: string;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({ description: 'Price as decimal string, e.g. 12.50', example: '12.50' })
  price?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Exhibitor id', example: 'cl0x1234abcd' })
  exhibitorId?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [String], description: 'Array of existing asset ids to link', example: ['assetId1', 'assetId2'] })
  assets?: string[];

  @IsOptional()
  @ApiPropertyOptional({ description: 'Arbitrary JSON metadata', type: 'object', example: { color: 'red', size: 'L' } })
  metadata?: any;
}
