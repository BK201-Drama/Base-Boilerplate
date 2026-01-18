import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

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

  @IsString()
  nickname?: string;

  @IsString()
  avatar?: string;

  @IsNotEmpty({ message: 'validation.status_required' })
  status: string;
}
