/**
 * DTO 生成器
 * 根据 ResourceDefinition 生成 Create 和 Update DTO
 */

import { ResourceDefinition, FieldConfig, FieldType } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class DtoGenerator {
  /**
   * 生成 Create DTO
   */
  generateCreateDto(resource: ResourceDefinition): string {
    const className = this.toPascalCase(resource.name);
    const fields = resource.fields.filter((f) => f.includeInCreate !== false);

    const imports = this.generateImports(fields);
    const classBody = fields
      .map((field) => this.generateFieldDecorators(field, 'create'))
      .join('\n\n');

    return `import { ${imports.join(', ')} } from 'class-validator';

export class Create${className}Dto {
${classBody}
}
`;
  }

  /**
   * 生成 Update DTO
   */
  generateUpdateDto(resource: ResourceDefinition): string {
    const className = this.toPascalCase(resource.name);
    const createDtoName = `Create${className}Dto`;

    return `import { PartialType } from '@nestjs/mapped-types';
import { ${createDtoName} } from './create-${resource.name}.dto';

export class Update${className}Dto extends PartialType(${createDtoName}) {}
`;
  }

  /**
   * 生成字段装饰器
   */
  private generateFieldDecorators(
    field: FieldConfig,
    context: 'create' | 'update',
  ): string {
    const decorators: string[] = [];
    const validations = field.validations || [];

    // 必填验证
    if (field.required && context === 'create') {
      decorators.push(
        `  @IsNotEmpty({ message: '${field.validations?.[0]?.message || `validation.${field.name}_required`}' })`,
      );
    } else if (context === 'update') {
      decorators.push('  @IsOptional()');
    }

    // 类型验证
    switch (field.type) {
      case 'string':
        decorators.push('  @IsString()');
        break;
      case 'number':
        decorators.push('  @IsNumber()');
        break;
      case 'boolean':
        decorators.push('  @IsBoolean()');
        break;
      case 'date':
        decorators.push('  @IsDateString()');
        break;
    }

    // 其他验证规则
    validations.forEach((validation) => {
      if (validation.type === 'email') {
        decorators.push(
          `  @IsEmail({}, { message: '${validation.message || 'validation.email_invalid'}' })`,
        );
      } else if (validation.type === 'min') {
        decorators.push(`  @Min(${validation.value}, { message: '${validation.message || `validation.${field.name}_min`}' })`);
      } else if (validation.type === 'max') {
        decorators.push(`  @Max(${validation.value}, { message: '${validation.message || `validation.${field.name}_max`}' })`);
      } else if (validation.type === 'pattern') {
        decorators.push(
          `  @Matches(/${validation.value}/, { message: '${validation.message || `validation.${field.name}_format`}' })`,
        );
      }
    });

    // 字段定义
    const optional = context === 'update' || !field.required ? '?' : '';
    const type = this.getTypeScriptType(field.type);
    decorators.push(`  ${field.name}${optional}: ${type};`);

    return decorators.join('\n');
  }

  /**
   * 生成导入语句
   */
  private generateImports(fields: FieldConfig[]): string[] {
    const imports = new Set<string>();

    fields.forEach((field) => {
      if (field.required) {
        imports.add('IsNotEmpty');
      } else {
        imports.add('IsOptional');
      }

      switch (field.type) {
        case 'string':
          imports.add('IsString');
          break;
        case 'number':
          imports.add('IsNumber');
          break;
        case 'boolean':
          imports.add('IsBoolean');
          break;
        case 'date':
          imports.add('IsDateString');
          break;
      }

      field.validations?.forEach((validation) => {
        if (validation.type === 'email') {
          imports.add('IsEmail');
        } else if (validation.type === 'min') {
          imports.add('Min');
        } else if (validation.type === 'max') {
          imports.add('Max');
        } else if (validation.type === 'pattern') {
          imports.add('Matches');
        }
      });
    });

    return Array.from(imports);
  }

  /**
   * 获取 TypeScript 类型
   */
  private getTypeScriptType(fieldType: FieldType): string {
    const typeMap: Record<FieldType, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'string',
      enum: 'string',
      relation: 'string',
      json: 'any',
    };
    return typeMap[fieldType] || 'any';
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 写入文件
   */
  writeFiles(
    resource: ResourceDefinition,
    outputDir: string,
    overwrite: boolean = false,
  ): void {
    const dtoDir = path.join(outputDir, resource.name, 'dto');

    // 创建目录
    if (!fs.existsSync(dtoDir)) {
      fs.mkdirSync(dtoDir, { recursive: true });
    }

    // 生成 Create DTO
    const createDtoPath = path.join(dtoDir, `create-${resource.name}.dto.ts`);
    if (!fs.existsSync(createDtoPath) || overwrite) {
      fs.writeFileSync(createDtoPath, this.generateCreateDto(resource));
    }

    // 生成 Update DTO
    const updateDtoPath = path.join(dtoDir, `update-${resource.name}.dto.ts`);
    if (!fs.existsSync(updateDtoPath) || overwrite) {
      fs.writeFileSync(updateDtoPath, this.generateUpdateDto(resource));
    }
  }
}

