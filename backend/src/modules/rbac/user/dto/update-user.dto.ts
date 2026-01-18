import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
