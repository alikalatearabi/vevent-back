import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindEventsDto {
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
  @ApiPropertyOptional({ description: 'Search query for name/title/description' })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ISO date string filter - start from (inclusive) UTC' })
  from?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ISO date string filter - end to (inclusive) UTC' })
  to?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by tag name' })
  tag?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by exhibitor id' })
  exhibitorId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'If true, return only upcoming events' })
  upcoming?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Timezone string (IANA) - optional' })
  tz?: string;
}
