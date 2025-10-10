import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 20 })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search query for product name or description' })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by exhibitor id' })
  exhibitorId?: string;
}
