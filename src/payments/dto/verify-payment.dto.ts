import { IsString, IsNotEmpty, IsUUID, IsOptional, ValidateIf } from 'class-validator';

export class VerifyPaymentDto {
  @ValidateIf((o) => !o.id_get && !o.trans_id)
  @IsNotEmpty({ message: 'شناسه پرداخت یا شناسه تراکنش BitPay الزامی است' })
  @IsString({ message: 'شناسه پرداخت باید یک رشته باشد' })
  @IsUUID('4', { message: 'شناسه پرداخت باید یک UUID معتبر باشد' })
  paymentId?: string;

  @IsOptional()
  @IsString()
  authority?: string; // Gateway transaction ID (Zarinpal)

  @IsOptional()
  @IsString()
  status?: string; // "OK" or "NOK" from gateway

  // BitPay specific fields
  @ValidateIf((o) => !o.paymentId)
  @IsNotEmpty({ message: 'شناسه تراکنش BitPay (id_get یا trans_id) الزامی است اگر paymentId ارائه نشده باشد' })
  @IsString()
  id_get?: string; // BitPay transaction ID

  @IsOptional()
  @IsString()
  trans_id?: string; // BitPay transaction ID
}

