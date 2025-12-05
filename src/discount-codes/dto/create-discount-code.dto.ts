import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, IsUUID, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class CreateDiscountCodeDto {
  @ApiProperty({ description: 'Discount code (e.g., SUMMER30)', example: 'SUMMER30' })
  @IsNotEmpty({ message: 'کد تخفیف الزامی است' })
  @IsString({ message: 'کد تخفیف باید یک رشته باشد' })
  code: string;

  @ApiProperty({ description: 'Discount type', enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsNotEmpty({ message: 'نوع تخفیف الزامی است' })
  @IsEnum(DiscountType, { message: 'نوع تخفیف نامعتبر است' })
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)', example: 30 })
  @IsNotEmpty({ message: 'مقدار تخفیف الزامی است' })
  @IsNumber({}, { message: 'مقدار تخفیف باید یک عدد باشد' })
  @Min(0, { message: 'مقدار تخفیف نمی‌تواند منفی باشد' })
  @Max(100, { message: 'درصد تخفیف نمی‌تواند بیشتر از 100 باشد' })
  discountValue: number;

  @ApiPropertyOptional({ description: 'Expiration date (ISO string)', example: '2025-12-25T23:59:59Z' })
  @IsOptional()
  @IsDateString({}, { message: 'تاریخ انقضا باید یک تاریخ معتبر باشد' })
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Maximum number of uses (null = unlimited)', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'حداکثر تعداد استفاده باید یک عدد باشد' })
  @Min(1, { message: 'حداکثر تعداد استفاده باید حداقل 1 باشد' })
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Allow only one use per user', example: false, default: false })
  @IsOptional()
  @IsBoolean({ message: 'singleUsePerUser باید یک مقدار boolean باشد' })
  singleUsePerUser?: boolean;

  @ApiPropertyOptional({ description: 'Minimum purchase amount required', example: 1000000 })
  @IsOptional()
  @IsNumber({}, { message: 'حداقل مبلغ خرید باید یک عدد باشد' })
  @Min(0, { message: 'حداقل مبلغ خرید نمی‌تواند منفی باشد' })
  minPurchaseAmount?: number;

  @ApiPropertyOptional({ description: 'Event ID to restrict discount to specific event' })
  @IsOptional()
  @IsUUID('4', { message: 'شناسه رویداد باید یک UUID معتبر باشد' })
  eventId?: string;

  @ApiPropertyOptional({ description: 'Description of the discount code' })
  @IsOptional()
  @IsString({ message: 'توضیحات باید یک رشته باشد' })
  description?: string;
}

