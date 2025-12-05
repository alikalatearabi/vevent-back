import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Event ID', example: 'uuid' })
  @IsNotEmpty({ message: 'شناسه رویداد الزامی است' })
  @IsString({ message: 'شناسه رویداد باید یک رشته باشد' })
  @IsUUID('4', { message: 'شناسه رویداد باید یک UUID معتبر باشد' })
  eventId: string;

  @ApiPropertyOptional({ description: 'Optional discount code', example: 'SUMMER30' })
  @IsOptional()
  @IsString({ message: 'کد تخفیف باید یک رشته باشد' })
  discountCode?: string;
}

