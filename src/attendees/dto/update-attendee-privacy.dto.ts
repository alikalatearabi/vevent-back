import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAttendeePrivacyDto {
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  showCompany?: boolean;
}

