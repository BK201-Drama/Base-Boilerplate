import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}
