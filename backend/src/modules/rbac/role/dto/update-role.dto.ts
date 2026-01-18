import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
