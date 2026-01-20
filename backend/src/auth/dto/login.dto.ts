import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'validation.username_or_email_required' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'validation.password_required' })
  @IsString()
  password: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'validation.username_required' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'validation.email_required' })
  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;

  @IsNotEmpty({ message: 'validation.password_required' })
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}

export class WechatLoginDto {
  @IsNotEmpty({ message: 'validation.code_required' })
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  state?: string;
}
