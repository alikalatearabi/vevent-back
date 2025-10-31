import { IsString, Matches, IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty({ message: 'شماره تلفن الزامی است' })
  @IsString({ message: 'شماره تلفن باید یک رشته باشد' })
  @Matches(/^09\d{9}$/, { 
    message: 'شماره تلفن معتبر نیست' 
  })
  phone: string;
}

