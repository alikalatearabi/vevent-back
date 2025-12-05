import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class UpdateDiscountCodeDto {
  @ApiPropertyOptional({ description: 'Discount code' })
  @IsOptional()
  @IsString({ message: 'کد تخفیف باید یک رشته باشد' })
  code?: string;

  @ApiPropertyOptional({ description: 'Discount type', enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType, { message: 'نوع تخفیف نامعتبر است' })
  discountType?: DiscountType;

  @ApiPropertyOptional({ description: 'Discount value' })
  @IsOptional()
  @IsNumber({}, { message: 'مقدار تخفیف باید یک عدد باشد' })
  @Min(0, { message: 'مقدار تخفیف نمی‌تواند منفی باشد' })
  @Max(100, { message: 'درصد تخفیف نمی‌تواند بیشتر از 100 باشد' })
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsDateString({}, { message: 'تاریخ انقضا باید یک تاریخ معتبر باشد' })
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Maximum number of uses' })
  @IsOptional()
  @IsNumber({}, { message: 'حداکثر تعداد استفاده باید یک عدد باشد' })
  @Min(1, { message: 'حداکثر تعداد استفاده باید حداقل 1 باشد' })
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Allow only one use per user' })
  @IsOptional()
  @IsBoolean({ message: 'singleUsePerUser باید یک مقدار boolean باشد' })
  singleUsePerUser?: boolean;

  @ApiPropertyOptional({ description: 'Minimum purchase amount' })
  @IsOptional()
  @IsNumber({}, { message: 'حداقل مبلغ خرید باید یک عدد باشد' })
  @Min(0, { message: 'حداقل مبلغ خرید نمی‌تواند منفی باشد' })
  minPurchaseAmount?: number;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعال باید یک مقدار boolean باشد' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString({ message: 'توضیحات باید یک رشته باشد' })
  description?: string;
}

