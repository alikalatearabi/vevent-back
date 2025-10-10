import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindExhibitorsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 20 })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search query for name or title' })
  q?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase();
    return v === 'true' || v === '1';
  })
  @ApiPropertyOptional({ description: 'Filter sponsors only', type: Boolean })
  sponsor?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Tag name to filter by' })
  tag?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Sort field, e.g. favoriteCount or name' })
  sort?: string; // e.g. "name", "createdAt", "favoriteCount"
}
