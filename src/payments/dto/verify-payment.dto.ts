import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty({ message: 'شناسه پرداخت الزامی است' })
  @IsString({ message: 'شناسه پرداخت باید یک رشته باشد' })
  @IsUUID('4', { message: 'شناسه پرداخت باید یک UUID معتبر باشد' })
  paymentId: string;

  @IsOptional()
  @IsString()
  authority?: string; // Gateway transaction ID

  @IsOptional()
  @IsString()
  status?: string; // "OK" or "NOK" from gateway
}

