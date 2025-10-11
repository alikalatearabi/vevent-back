import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @IsString()
  @ApiProperty({ example: 'gaming', description: 'Tag name (unique)' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Gaming Products', description: 'Display title' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '#10B981', description: 'Color code for frontend display' })
  color?: string;
}
