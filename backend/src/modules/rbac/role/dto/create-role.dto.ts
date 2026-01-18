import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'validation.name_required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'validation.code_required' })
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}
