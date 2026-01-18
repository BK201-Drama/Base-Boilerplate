import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'validation.name_required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'validation.code_required' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'validation.resource_required' })
  @IsString()
  resource: string;

  @IsNotEmpty({ message: 'validation.action_required' })
  @IsString()
  action: string;

  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'validation.Text_required' })
  @IsString()
  Text: string;

  @IsNotEmpty({ message: 'validation.updatedAt_required' })
  @IsDateString()
  updatedAt: string;
}
