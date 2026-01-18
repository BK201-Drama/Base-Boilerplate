import { IsNotEmpty, IsString, IsEmail, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'validation.username_required' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'validation.email_invalid' })
  @IsString()
  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;

  @IsNotEmpty({ message: 'validation.password_required' })
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'banned'], { message: 'validation.status_invalid' })
  status?: string;
}
