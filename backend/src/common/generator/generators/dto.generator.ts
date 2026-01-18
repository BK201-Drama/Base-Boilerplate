/**
 * DTO 生成器
 * 根据 ResourceDefinition 生成 Create 和 Update DTO
 */

import { ResourceDefinition, FieldConfig, FieldType, RelationBindingConfig, RelationType } from '../types/resource.types';
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

    // 生成关系绑定字段
    const bindingFields = this.generateRelationBindingFields(resource);

    // 如果有绑定字段，需要添加额外的导入和字段
    if (bindingFields) {
      return `import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { ${createDtoName} } from './create-${resource.name}.dto';

export class Update${className}Dto extends PartialType(${createDtoName}) {
${bindingFields}
}
`;
    }

    return `import { PartialType } from '@nestjs/mapped-types';
import { ${createDtoName} } from './create-${resource.name}.dto';

export class Update${className}Dto extends PartialType(${createDtoName}) {}
`;
  }

  /**
   * 生成关系绑定字段（支持一对一、一对多、多对多）
   */
  private generateRelationBindingFields(resource: ResourceDefinition): string {
    if (!resource.relationBindings || resource.relationBindings.length === 0) {
      return '';
    }

    const fields: string[] = [];

    resource.relationBindings.forEach((binding) => {
      // 如果配置为在Update中处理，才添加到DTO中
      if (binding.handleInUpdate !== false) {
        // 判断关系类型
        const relationType = this.determineRelationType(binding);
        
        // 生成DTO字段名
        const dtoFieldName = binding.dtoFieldName || this.generateDtoFieldName(binding, relationType);
        
        if (relationType === 'many-to-many') {
          // 多对多：数组类型
          fields.push(`  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ${dtoFieldName}?: string[];`);
        } else {
          // 一对一和一对多：单个ID类型
          fields.push(`  @IsOptional()
  @IsString()
  ${dtoFieldName}?: string;`);
        }
      }
    });

    return fields.join('\n\n');
  }

  /**
   * 判断关系类型
   */
  private determineRelationType(binding: RelationBindingConfig): RelationType {
    // 如果明确指定了关系类型，使用指定的
    if (binding.relationType) {
      return binding.relationType;
    }
    
    // 如果有中间表，则是多对多
    if (binding.junctionModel) {
      return 'many-to-many';
    }
    
    // 默认根据字段名判断（复数通常是多对多或一对多）
    const isPlural = binding.field.endsWith('s') || binding.field.endsWith('ies');
    return isPlural ? 'one-to-many' : 'one-to-one';
  }

  /**
   * 生成DTO字段名
   */
  private generateDtoFieldName(binding: RelationBindingConfig, relationType: RelationType): string {
    // 如果明确指定了DTO字段名，使用指定的
    if (binding.dtoFieldName) {
      return binding.dtoFieldName;
    }
    
    if (relationType === 'many-to-many') {
      // 多对多：relatedModel的小写形式 + "Ids"
      const camelCase = this.toCamelCase(binding.relatedModel);
      return `${camelCase}Ids`;
    } else {
      // 一对一和一对多：使用外键字段名或自动生成
      if (binding.foreignKeyField) {
        return binding.foreignKeyField;
      }
      // 自动生成：如果field是复数，使用relatedModel + "Id"，否则使用field + "Id"
      const isPlural = binding.field.endsWith('s') || binding.field.endsWith('ies');
      if (isPlural) {
        const camelCase = this.toCamelCase(binding.relatedModel);
        return `${camelCase}Id`;
      } else {
        return `${binding.field}Id`;
      }
    }
  }

  /**
   * 生成DTO字段名（如Role -> roleIds）
   */
  private generateDtoFieldName(modelName: string): string {
    const camelCase = this.toCamelCase(modelName);
    return `${camelCase}Ids`;
  }

  /**
   * 转换为驼峰命名
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
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

