import { IsString, IsOptional, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExhibitorDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  website?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  location?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: false })
  sponsor?: boolean;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [String] })
  tags?: string[];
}
