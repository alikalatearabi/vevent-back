import { IsString, IsOptional, IsBoolean, IsArray, IsISO8601, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  color?: string;

  @IsISO8601()
  @ApiProperty({ description: 'ISO datetime in UTC or with timezone' })
  start: string;

  @IsISO8601()
  @ApiProperty({ description: 'ISO datetime in UTC or with timezone' })
  end: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'IANA timezone e.g. Asia/Tehran' })
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: true })
  timed?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  location?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Exhibitor id' })
  exhibitorId?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [String], description: 'speaker user ids' })
  speakers?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: false })
  published?: boolean;
}
