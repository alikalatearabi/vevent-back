import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateConnectionRequestDto {
  @IsString()
  receiverId: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateConnectionRequestDto {
  @IsEnum(['accepted', 'rejected'])
  status: 'accepted' | 'rejected';
}
