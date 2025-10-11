import { IsEmail, IsString, MinLength, IsBoolean, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Matches(/^09\d{9}$/, { message: 'Phone must be in Iranian mobile format (09XXXXXXXXX)' })
  phone: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsBoolean()
  toc: boolean;
}
