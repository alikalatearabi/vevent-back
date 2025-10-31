import { IsString, Matches, IsNotEmpty, IsUUID } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'شناسه نشست الزامی است' })
  @IsString({ message: 'شناسه نشست باید یک رشته باشد' })
  @IsUUID('4', { message: 'شناسه نشست باید یک UUID معتبر باشد' })
  sessionId: string;

  @IsNotEmpty({ message: 'کد تایید الزامی است' })
  @IsString({ message: 'کد تایید باید یک رشته باشد' })
  @Matches(/^\d{4,6}$/, { 
    message: 'کد تایید باید ۴ تا ۶ رقم باشد' 
  })
  otp: string;
}

