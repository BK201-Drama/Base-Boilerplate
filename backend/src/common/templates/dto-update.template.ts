/**
 * Update DTO 模板
 *
 * 使用方法：
 * 1. 将 {EntityName} 替换为实际的实体名称（首字母大写，如 Product）
 * 2. 继承 Create{EntityName}Dto 并使用 PartialType
 * 3. 所有字段都应该是可选的
 */

import { PartialType } from '@nestjs/mapped-types';
import { Create{EntityName}Dto } from './create-{entityName}.dto';
import { IsOptional } from 'class-validator';

export class Update{EntityName}Dto extends PartialType(Create{EntityName}Dto) {
  // TODO: 如果需要添加额外的更新字段，在这里添加
  // 例如：
  // @IsOptional()
  // @IsString()
  // status?: string;
}

