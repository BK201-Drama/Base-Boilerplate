/**
 * Create DTO 模板
 *
 * 使用方法：
 * 1. 将 {EntityName} 替换为实际的实体名称（首字母大写，如 Product）
 * 2. 根据 Prisma schema 中的字段添加验证装饰器
 * 3. 使用 class-validator 装饰器进行验证
 * 4. 使用 i18n key 作为错误消息
 */

import { IsString, IsEmail, IsOptional, IsNotEmpty, IsNumber, IsBoolean, IsDateString, IsEnum, Min, Max, Length } from 'class-validator';

export class Create{EntityName}Dto {
  // TODO: 根据 Prisma schema 添加字段
  // 示例字段：

  // @IsNotEmpty({ message: 'validation.name_required' })
  // @IsString()
  // @Length(1, 100)
  // name: string;

  // @IsOptional()
  // @IsString()
  // description?: string;

  // @IsNotEmpty({ message: 'validation.email_required' })
  // @IsEmail({}, { message: 'validation.email_invalid' })
  // email: string;

  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // @Max(100)
  // price?: number;

  // @IsOptional()
  // @IsBoolean()
  // isActive?: boolean;

  // @IsOptional()
  // @IsDateString()
  // publishedAt?: string;

  // @IsOptional()
  // @IsEnum(['draft', 'published', 'archived'])
  // status?: string;
}

