import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}
