import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateDiscountCodeDto {
  @ApiProperty({ description: 'Discount code to validate', example: 'SUMMER30' })
  @IsNotEmpty({ message: 'کد تخفیف الزامی است' })
  @IsString({ message: 'کد تخفیف باید یک رشته باشد' })
  code: string;

  @ApiProperty({ description: 'Event ID', example: 'uuid' })
  @IsNotEmpty({ message: 'شناسه رویداد الزامی است' })
  @IsUUID('4', { message: 'شناسه رویداد باید یک UUID معتبر باشد' })
  eventId: string;

  @ApiProperty({ description: 'Original amount before discount', example: 55000000 })
  @IsNotEmpty({ message: 'مبلغ اولیه الزامی است' })
  @IsNumber({}, { message: 'مبلغ اولیه باید یک عدد باشد' })
  @Min(0, { message: 'مبلغ اولیه نمی‌تواند منفی باشد' })
  amount: number;

  @ApiPropertyOptional({ description: 'User ID to check if user has already used this code (for singleUsePerUser validation)' })
  @IsOptional()
  @IsUUID('4', { message: 'شناسه کاربر باید یک UUID معتبر باشد' })
  userId?: string;
}

