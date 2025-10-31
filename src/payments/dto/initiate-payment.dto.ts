import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @IsNotEmpty({ message: 'شناسه رویداد الزامی است' })
  @IsString({ message: 'شناسه رویداد باید یک رشته باشد' })
  @IsUUID('4', { message: 'شناسه رویداد باید یک UUID معتبر باشد' })
  eventId: string;
}

