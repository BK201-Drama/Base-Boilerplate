import { IsNotEmpty, IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'validation.username_required' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'validation.email_required' })
  @IsString()
  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;

  @IsNotEmpty({ message: 'validation.password_required' })
  @IsString()
  password: string;

  @IsString()
  nickname?: string;

  @IsString()
  URL?: string;

  @IsNotEmpty({ message: 'validation.status_required' })
  @IsString()
  status: string;

  @IsNotEmpty({ message: 'validation.roles_required' })
  @IsString()
  roles: string;

  @IsNotEmpty({ message: 'validation.operationLogs_required' })
  @IsString()
  operationLogs: string;

  @IsNotEmpty({ message: 'validation.updatedAt_required' })
  @IsDateString()
  updatedAt: string;
}
