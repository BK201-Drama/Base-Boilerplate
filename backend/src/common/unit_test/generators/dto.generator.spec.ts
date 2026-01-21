import { DtoGenerator } from '../../generator/generators/dto.generator';
import { ResourceDefinition } from '../../generator/types/resource.types';
import * as fs from 'fs';
import * as path from 'path';

describe('DtoGenerator', () => {
  let generator: DtoGenerator;

  beforeEach(() => {
    generator = new DtoGenerator();
  });

  describe('generateCreateDto', () => {
    it('应该生成基本的 Create DTO', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            name: 'email',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('export class CreateUserDto');
      expect(result).toContain('@IsNotEmpty');
      expect(result).toContain('@IsString');
      expect(result).toContain('name: string');
      expect(result).toContain('email: string');
    });

    it('应该排除自动生成的字段', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          {
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            name: 'title',
            type: 'string',
            required: true,
          },
          {
            name: 'createdAt',
            type: 'date',
            required: true,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).not.toContain('id:');
      expect(result).not.toContain('createdAt:');
      expect(result).toContain('title:');
    });

    it('应该排除 includeInCreate 为 false 的字段', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
            includeInCreate: true,
          },
          {
            name: 'viewCount',
            type: 'number',
            includeInCreate: false,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('title:');
      expect(result).not.toContain('viewCount:');
    });

    it('应该生成包含验证规则的 DTO', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'email',
            type: 'string',
            required: true,
            validations: [
              {
                type: 'email',
                message: 'validation.email_invalid',
              },
            ],
          },
          {
            name: 'age',
            type: 'number',
            required: true,
            validations: [
              {
                type: 'min',
                value: 18,
                message: 'validation.age_min',
              },
              {
                type: 'max',
                value: 100,
                message: 'validation.age_max',
              },
            ],
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('@IsEmail');
      expect(result).toContain('@Min(18');
      expect(result).toContain('@Max(100');
    });

    it('应该生成包含可选字段的 DTO', () => {
      const resource: ResourceDefinition = {
        name: 'product',
        prismaModel: 'Product',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            name: 'description',
            type: 'string',
            required: false,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('name: string');
      expect(result).toContain('description?: string');
      // 可选字段在 Create DTO 中不需要 @IsOptional（因为 required 为 false）
      expect(result).toContain('@IsString');
    });

    it('应该排除关系字段', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
          },
          {
            name: 'author',
            type: 'relation',
            required: true,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('title:');
      expect(result).not.toContain('author:');
    });
  });

  describe('generateUpdateDto', () => {
    it('应该生成基本的 Update DTO', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('export class UpdateUserDto extends PartialType(CreateUserDto)');
      expect(result).toContain('import { PartialType } from \'@nestjs/mapped-types\'');
    });

    it('应该生成包含关系绑定字段的 Update DTO', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
        relationBindings: [
          {
            field: 'roles',
            relatedModel: 'Role',
            relationType: 'many-to-many',
            handleInUpdate: true,
            junctionModel: 'UserRole',
            currentModelForeignKey: 'userId',
            relatedModelForeignKey: 'roleId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('roleIds?: number[]');
      expect(result).toContain('@IsOptional');
      expect(result).toContain('@IsArray');
      expect(result).toContain('@IsInt({ each: true })');
    });

    it('应该生成一对一关系绑定字段', () => {
      const resource: ResourceDefinition = {
        name: 'profile',
        prismaModel: 'Profile',
        fields: [
          {
            name: 'bio',
            type: 'string',
            required: false,
          },
        ],
        relationBindings: [
          {
            field: 'user',
            relatedModel: 'User',
            relationType: 'one-to-one',
            handleInUpdate: true,
            foreignKeyField: 'userId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('userId?: number');
      expect(result).toContain('@IsInt');
    });

    it('应该排除 handleInUpdate 为 false 的关系绑定', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
          },
        ],
        relationBindings: [
          {
            field: 'tags',
            relatedModel: 'Tag',
            relationType: 'many-to-many',
            handleInUpdate: false,
            junctionModel: 'PostTag',
            currentModelForeignKey: 'postId',
            relatedModelForeignKey: 'tagId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).not.toContain('tagIds');
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理空字段数组', () => {
      const resource: ResourceDefinition = {
        name: 'empty',
        prismaModel: 'Empty',
        fields: [],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('export class CreateEmptyDto');
      // 应该只包含必要的导入，即使没有字段
      expect(result).toBeTruthy();
    });

    it('应该处理所有字段都被排除的情况', () => {
      const resource: ResourceDefinition = {
        name: 'log',
        prismaModel: 'Log',
        fields: [
          {
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            name: 'createdAt',
            type: 'date',
            required: true,
          },
          {
            name: 'viewCount',
            type: 'number',
            includeInCreate: false,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      // 应该仍然生成类，即使没有字段
      expect(result).toContain('export class CreateLogDto');
    });

    it('应该处理无效的验证规则', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'email',
            type: 'string',
            required: true,
            validations: [
              {
                type: 'email',
                // 缺少 message
              } as any,
            ],
          },
        ],
      };

      // 不应该抛出错误
      expect(() => {
        generator.generateCreateDto(resource);
      }).not.toThrow();
    });

    it('应该处理 pattern 验证规则', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'phone',
            type: 'string',
            required: true,
            validations: [
              {
                type: 'pattern',
                value: '^\\d{11}$',
                message: 'validation.phone_format',
              },
            ],
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('@Matches');
      expect(result).toContain('phone_format');
    });

    it('应该处理 JSON 类型字段', () => {
      const resource: ResourceDefinition = {
        name: 'config',
        prismaModel: 'Config',
        fields: [
          {
            name: 'settings',
            type: 'json',
            required: false,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('settings?: any');
    });

    it('应该处理日期类型字段', () => {
      const resource: ResourceDefinition = {
        name: 'event',
        prismaModel: 'Event',
        fields: [
          {
            name: 'startDate',
            type: 'date',
            required: true,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('@IsDateString');
      expect(result).toContain('startDate: string');
    });

    it('应该处理没有关系绑定的 Update DTO', () => {
      const resource: ResourceDefinition = {
        name: 'simple',
        prismaModel: 'Simple',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
        // 没有 relationBindings
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('extends PartialType(CreateSimpleDto)');
      expect(result).not.toContain('@IsOptional');
      expect(result).not.toContain('@IsArray');
    });

    it('应该处理多个关系绑定', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
          },
        ],
        relationBindings: [
          {
            field: 'tags',
            relatedModel: 'Tag',
            relationType: 'many-to-many',
            handleInUpdate: true,
            junctionModel: 'PostTag',
            currentModelForeignKey: 'postId',
            relatedModelForeignKey: 'tagId',
          },
          {
            field: 'category',
            relatedModel: 'Category',
            relationType: 'one-to-one',
            handleInUpdate: true,
            foreignKeyField: 'categoryId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('tagIds?: number[]');
      expect(result).toContain('categoryId?: number');
    });

    it('应该处理关系绑定但没有 handleInUpdate', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
        relationBindings: [
          {
            field: 'roles',
            relatedModel: 'Role',
            relationType: 'many-to-many',
            handleInUpdate: false, // 明确设置为 false
            junctionModel: 'UserRole',
            currentModelForeignKey: 'userId',
            relatedModelForeignKey: 'roleId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).not.toContain('roleIds');
    });

    it('应该处理 Update DTO 中所有字段都是可选的', () => {
      const resource: ResourceDefinition = {
        name: 'optional',
        prismaModel: 'Optional',
        fields: [
          {
            name: 'field1',
            type: 'string',
            required: false,
          },
          {
            name: 'field2',
            type: 'number',
            required: false,
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('extends PartialType(CreateOptionalDto)');
    });
  });

  describe('字段装饰器生成', () => {
    it('应该为 Update DTO 的所有字段添加 @IsOptional', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          {
            name: 'required',
            type: 'string',
            required: true,
          },
          {
            name: 'optional',
            type: 'string',
            required: false,
          },
        ],
      };

      const createDto = generator.generateCreateDto(resource);
      const updateDto = generator.generateUpdateDto(resource);

      // Create DTO 中必填字段应该有 @IsNotEmpty
      expect(createDto).toContain('@IsNotEmpty');
      // Update DTO 继承 PartialType，所有字段都是可选的
      expect(updateDto).toContain('PartialType');
    });

    it('应该处理所有验证类型', () => {
      const resource: ResourceDefinition = {
        name: 'validations',
        prismaModel: 'Validations',
        fields: [
          {
            name: 'email',
            type: 'string',
            required: true,
            validations: [{ type: 'email', message: 'invalid_email' }],
          },
          {
            name: 'age',
            type: 'number',
            required: true,
            validations: [
              { type: 'min', value: 18, message: 'too_young' },
              { type: 'max', value: 100, message: 'too_old' },
            ],
          },
          {
            name: 'phone',
            type: 'string',
            required: true,
            validations: [{ type: 'pattern', value: '^\\d+$', message: 'invalid_phone' }],
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('@IsEmail');
      expect(result).toContain('@Min(18');
      expect(result).toContain('@Max(100');
      expect(result).toContain('@Matches');
    });

    it('应该处理验证规则没有 message 的情况', () => {
      const resource: ResourceDefinition = {
        name: 'noMessage',
        prismaModel: 'NoMessage',
        fields: [
          {
            name: 'email',
            type: 'string',
            required: true,
            validations: [{ type: 'email' }],
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('@IsEmail');
      // 应该使用默认消息
      expect(result).toContain('validation.email_invalid');
    });

    it('应该处理自定义验证规则', () => {
      const resource: ResourceDefinition = {
        name: 'custom',
        prismaModel: 'Custom',
        fields: [
          {
            name: 'field',
            type: 'string',
            required: true,
            validations: [{ type: 'custom', value: 'customValidator' }],
          },
        ],
      };

      // 自定义验证规则可能不会被处理，但不应抛出错误
      expect(() => {
        generator.generateCreateDto(resource);
      }).not.toThrow();
    });
  });

  describe('关系绑定字段生成', () => {
    it('应该处理一对多关系绑定', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          { name: 'title', type: 'string', required: true },
        ],
        relationBindings: [
          {
            field: 'comments',
            relatedModel: 'Comment',
            relationType: 'one-to-many',
            handleInUpdate: true,
            foreignKeyField: 'postId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('postId?: number');
      expect(result).toContain('@IsInt');
    });

    it('应该处理自定义 DTO 字段名', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [],
        relationBindings: [
          {
            field: 'roles',
            relatedModel: 'Role',
            relationType: 'many-to-many',
            handleInUpdate: true,
            dtoFieldName: 'customRoleIds',
            junctionModel: 'UserRole',
            currentModelForeignKey: 'userId',
            relatedModelForeignKey: 'roleId',
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      expect(result).toContain('customRoleIds?: number[]');
      expect(result).not.toContain('roleIds');
    });

    it('应该处理关系绑定字段名自动生成', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [],
        relationBindings: [
          {
            field: 'profile',
            relatedModel: 'Profile',
            relationType: 'one-to-one',
            handleInUpdate: true,
            // 没有指定 dtoFieldName 和 foreignKeyField
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      // 应该自动生成 profileId
      expect(result).toContain('profileId?: number');
    });

    it('应该处理复数字段名的一对多关系', () => {
      const resource: ResourceDefinition = {
        name: 'category',
        prismaModel: 'Category',
        fields: [],
        relationBindings: [
          {
            field: 'products',
            relatedModel: 'Product',
            relationType: 'one-to-many',
            handleInUpdate: true,
            // 没有指定 foreignKeyField
          },
        ],
      };

      const result = generator.generateUpdateDto(resource);

      // 复数字段应该生成 productId（relatedModel + Id）
      expect(result).toContain('productId?: number');
    });
  });

  describe('导入语句生成', () => {
    it('应该只为使用的验证器生成导入', () => {
      const resource: ResourceDefinition = {
        name: 'minimal',
        prismaModel: 'Minimal',
        fields: [
          { name: 'name', type: 'string', required: true },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('IsNotEmpty');
      expect(result).toContain('IsString');
      expect(result).not.toContain('IsEmail');
      expect(result).not.toContain('IsNumber');
    });

    it('应该处理所有字段都是可选的情况', () => {
      const resource: ResourceDefinition = {
        name: 'allOptional',
        prismaModel: 'AllOptional',
        fields: [
          { name: 'field1', type: 'string', required: false },
          { name: 'field2', type: 'number', required: false },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('IsOptional');
      expect(result).not.toContain('IsNotEmpty');
    });

    it('应该去重导入语句', () => {
      const resource: ResourceDefinition = {
        name: 'duplicate',
        prismaModel: 'Duplicate',
        fields: [
          { name: 'email1', type: 'string', required: true, validations: [{ type: 'email' }] },
          { name: 'email2', type: 'string', required: true, validations: [{ type: 'email' }] },
        ],
      };

      const result = generator.generateCreateDto(resource);

      // IsEmail 应该在导入语句中只出现一次（可能在装饰器中多次出现）
      const importLine = result.match(/import\s*\{[^}]*\}/)?.[0] || '';
      const importMatches = importLine.match(/IsEmail/g);
      expect(importMatches?.length).toBe(1);
    });
  });

  describe('TypeScript 类型映射', () => {
    it('应该正确映射所有字段类型到 TypeScript', () => {
      const resource: ResourceDefinition = {
        name: 'types',
        prismaModel: 'Types',
        fields: [
          { name: 'str', type: 'string', required: true },
          { name: 'num', type: 'number', required: true },
          { name: 'bool', type: 'boolean', required: true },
          { name: 'date', type: 'date', required: true },
          { name: 'enum', type: 'enum', enumValues: ['A', 'B'], required: true },
          { name: 'json', type: 'json', required: true },
        ],
      };

      const result = generator.generateCreateDto(resource);

      expect(result).toContain('str: string');
      expect(result).toContain('num: number');
      expect(result).toContain('bool: boolean');
      expect(result).toContain('date: string'); // date 映射为 string
      expect(result).toContain('enum: string'); // enum 映射为 string
      expect(result).toContain('json: any');
    });

    it('应该处理未知类型', () => {
      const resource: ResourceDefinition = {
        name: 'unknown',
        prismaModel: 'Unknown',
        fields: [
          {
            name: 'field',
            type: 'unknown' as any,
            required: true,
          },
        ],
      };

      const result = generator.generateCreateDto(resource);

      // 未知类型应该映射为 any
      expect(result).toContain('field: any');
    });
  });

  describe('文件写入', () => {
    const testOutputDir = path.join(process.cwd(), 'temp-test-output');

    beforeEach(() => {
      if (fs.existsSync(testOutputDir)) {
        fs.rmSync(testOutputDir, { recursive: true, force: true });
      }
    });

    afterEach(() => {
      if (fs.existsSync(testOutputDir)) {
        fs.rmSync(testOutputDir, { recursive: true, force: true });
      }
    });

    it('应该写入 Create 和 Update DTO 文件', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          { name: 'name', type: 'string', required: true },
        ],
      };

      generator.writeFiles(resource, testOutputDir, true);

      const createPath = path.join(testOutputDir, 'test', 'dto', 'create-test.dto.ts');
      const updatePath = path.join(testOutputDir, 'test', 'dto', 'update-test.dto.ts');

      expect(fs.existsSync(createPath)).toBe(true);
      expect(fs.existsSync(updatePath)).toBe(true);
    });

    it('应该处理 overwrite 为 false 的情况', () => {
      const resource: ResourceDefinition = {
        name: 'existing',
        prismaModel: 'Existing',
        fields: [
          { name: 'name', type: 'string', required: true },
        ],
      };

      const dtoDir = path.join(testOutputDir, 'existing', 'dto');
      fs.mkdirSync(dtoDir, { recursive: true });

      const createPath = path.join(dtoDir, 'create-existing.dto.ts');
      fs.writeFileSync(createPath, 'existing content');

      generator.writeFiles(resource, testOutputDir, false);

      const content = fs.readFileSync(createPath, 'utf-8');
      expect(content).toBe('existing content');
    });

    it('应该处理 overwrite 为 true 的情况', () => {
      const resource: ResourceDefinition = {
        name: 'overwrite',
        prismaModel: 'Overwrite',
        fields: [
          { name: 'name', type: 'string', required: true },
        ],
      };

      const dtoDir = path.join(testOutputDir, 'overwrite', 'dto');
      fs.mkdirSync(dtoDir, { recursive: true });

      const createPath = path.join(dtoDir, 'create-overwrite.dto.ts');
      fs.writeFileSync(createPath, 'old content');

      generator.writeFiles(resource, testOutputDir, true);

      const content = fs.readFileSync(createPath, 'utf-8');
      expect(content).not.toBe('old content');
      expect(content).toContain('CreateOverwriteDto');
    });
  });
});
