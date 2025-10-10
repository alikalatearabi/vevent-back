import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceType } from '@prisma/client';

export class CreateRecentDto {
  @IsEnum(ResourceType)
  @ApiProperty({ enum: ResourceType, example: ResourceType.PRODUCT })
  resourceType: ResourceType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'cl0x1234abcd' })
  resourceId: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Additional metadata for the recent entry', type: 'object' })
  metadata?: any;
}
