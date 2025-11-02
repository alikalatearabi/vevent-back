import { IsString, IsNotEmpty, IsEmail, MinLength, IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteProfileDto {
  @IsNotEmpty({ message: 'نام الزامی است' })
  @IsString({ message: 'نام باید یک رشته باشد' })
  @ApiProperty({ description: 'User first name', example: 'کاربر' })
  firstName: string;

  @IsNotEmpty({ message: 'نام خانوادگی الزامی است' })
  @IsString({ message: 'نام خانوادگی باید یک رشته باشد' })
  @ApiProperty({ description: 'User last name', example: 'جدید' })
  lastName: string;

  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string;

  @IsOptional()
  @IsString({ message: 'نام شرکت باید یک رشته باشد' })
  @ApiPropertyOptional({ description: 'Company name', example: 'نام شرکت' })
  company?: string;

  @IsOptional()
  @IsString({ message: 'عنوان شغلی باید یک رشته باشد' })
  @ApiPropertyOptional({ description: 'Job title', example: 'عنوان شغلی' })
  jobTitle?: string;

  @IsOptional()
  @ValidateIf((o) => o.password !== undefined && o.password !== null && o.password !== '')
  @IsString({ message: 'رمز عبور باید یک رشته باشد' })
  @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
  @ApiPropertyOptional({ description: 'User password (min 6 characters, optional if user already has password)', example: 'password123' })
  password?: string;

  @IsNotEmpty({ message: 'پذیرش قوانین و مقررات الزامی است' })
  @IsBoolean({ message: 'پذیرش قوانین باید true باشد' })
  @ApiProperty({ description: 'Terms and conditions acceptance (must be true)', example: true })
  toc: boolean;
}