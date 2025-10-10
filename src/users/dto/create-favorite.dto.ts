import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '@prisma/client';

export class CreateFavoriteDto {
  @IsEnum(ResourceType)
  @ApiProperty({ enum: ResourceType, example: ResourceType.EVENT })
  resourceType: ResourceType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'cl0x1234abcd' })
  resourceId: string;
}
