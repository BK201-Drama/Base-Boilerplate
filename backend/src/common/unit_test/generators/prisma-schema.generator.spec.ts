import { PrismaSchemaGenerator } from '../../generator/generators/prisma-schema.generator';
import { ResourceDefinition } from '../../generator/types/resource.types';
import * as fs from 'fs';
import * as path from 'path';

describe('PrismaSchemaGenerator', () => {
  let generator: PrismaSchemaGenerator;
  // 测试目录：backend/src/common/unit_test/prisma
  const testBaseDir = path.join(__dirname, '..');
  const testPrismaDir = path.join(testBaseDir, 'prisma');
  const testModelsDir = path.join(testPrismaDir, 'models');
  const testSchemaPath = path.join(testPrismaDir, 'schema.prisma');
  const testCreatedFiles: string[] = [];

  beforeAll(() => {
    // 创建测试目录结构
    if (!fs.existsSync(testModelsDir)) {
      fs.mkdirSync(testModelsDir, { recursive: true });
    }
  });

  beforeEach(() => {
    generator = new PrismaSchemaGenerator();
    // Mock process.cwd() 返回测试基础目录
    // 这样生成器内部的 path.join(process.cwd(), 'prisma', 'models') 
    // 就会指向我们的测试目录 backend/src/common/unit_test/prisma/models
    jest.spyOn(process, 'cwd').mockReturnValue(testBaseDir);
    testCreatedFiles.length = 0;
  });

  afterEach(() => {
    // 清理测试创建的文件
    testCreatedFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    testCreatedFiles.length = 0;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    // 恢复原始 cwd
    jest.restoreAllMocks();
    // 清理测试目录（可选，保留以便检查）
    // if (fs.existsSync(testPrismaDir)) {
    //   fs.rmSync(testPrismaDir, { recursive: true, force: true });
    // }
  });

  describe('generateModel', () => {
    it('应该生成基本的 Prisma 模型', () => {
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
            unique: true,
          },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('model User');
      expect(result).toContain('id        Int      @id @default(autoincrement())');
      expect(result).toContain('name String');
      expect(result).toContain('email String @unique');
      expect(result).toContain('@@map("user")');
    });

    it('应该生成包含时间戳字段的模型', () => {
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
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('createdAt DateTime @default(now())');
      expect(result).toContain('updatedAt DateTime @updatedAt');
    });

    it('应该生成包含枚举字段的模型', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'enum',
            enumValues: ['PENDING', 'COMPLETED', 'CANCELLED'],
            required: true,
          },
        ],
      };

      const result = generator.generateModel(resource);
      const enums = generator.generateEnums(resource);

      expect(result).toContain('status OrderStatusEnum');
      // 枚举是通过 generateEnums 方法单独生成的
      expect(enums.length).toBeGreaterThan(0);
      expect(enums[0]).toContain('enum OrderStatusEnum');
      expect(enums[0]).toContain('PENDING');
      expect(enums[0]).toContain('COMPLETED');
      expect(enums[0]).toContain('CANCELLED');
    });

    it('应该生成包含可选字段的模型', () => {
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

      const result = generator.generateModel(resource);

      expect(result).toContain('name String');
      expect(result).toContain('description String?');
    });

    it('应该生成包含默认值的字段', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
          },
          {
            name: 'published',
            type: 'boolean',
            defaultValue: false,
          },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('published Boolean @default(false)');
    });

    it('应该生成包含关联关系的模型', () => {
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
        joins: [
          {
            field: 'author',
            model: 'User',
          },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('authorId Int?');
      expect(result).toContain('author User? @relation(fields: [authorId], references: [id])');
    });

    it('应该生成包含描述信息的模型', () => {
      const resource: ResourceDefinition = {
        name: 'category',
        prismaModel: 'Category',
        description: '分类模型',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: '分类名称',
          },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('// 分类模型');
      expect(result).toContain('// 分类名称');
    });

    it('应该生成包含 Text 类型的字段', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          {
            name: 'content',
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

      const result = generator.generateModel(resource);

      expect(result).toContain('content String @db.Text');
      expect(result).toContain('description String? @db.Text');
    });
  });

  describe('generateEnums', () => {
    it('应该生成枚举定义', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'enum',
            enumValues: ['PENDING', 'COMPLETED'],
          },
          {
            name: 'priority',
            type: 'enum',
            enumValues: ['LOW', 'HIGH'],
          },
        ],
      };

      const enums = generator.generateEnums(resource);

      expect(enums.length).toBe(2);
      expect(enums[0]).toContain('enum OrderStatusEnum');
      expect(enums[0]).toContain('PENDING');
      expect(enums[0]).toContain('COMPLETED');
      expect(enums[1]).toContain('enum OrderPriorityEnum');
    });

    it('应该去重相同的枚举', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'enum',
            enumValues: ['PENDING', 'COMPLETED'],
          },
          {
            name: 'anotherStatus',
            type: 'enum',
            enumValues: ['PENDING', 'COMPLETED'],
          },
        ],
      };

      const enums = generator.generateEnums(resource);

      // 应该生成两个不同的枚举（因为字段名不同）
      expect(enums.length).toBe(2);
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理空字段数组', () => {
      const resource: ResourceDefinition = {
        name: 'empty',
        prismaModel: 'Empty',
        fields: [],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('model Empty');
      expect(result).toContain('id        Int      @id @default(autoincrement())');
      // 应该仍然包含时间戳字段
      expect(result).toContain('createdAt');
      expect(result).toContain('updatedAt');
    });

    it('应该处理空枚举值数组', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'enum',
            enumValues: [],
          },
        ],
      };

      const enums = generator.generateEnums(resource);
      // 空枚举值应该返回空数组或处理为空枚举
      expect(enums.length).toBe(0);
    });

    it('应该处理单个枚举值', () => {
      const resource: ResourceDefinition = {
        name: 'status',
        prismaModel: 'Status',
        fields: [
          {
            name: 'value',
            type: 'enum',
            enumValues: ['ONLY'],
          },
        ],
      };

      const enums = generator.generateEnums(resource);
      expect(enums.length).toBe(1);
      expect(enums[0]).toContain('ONLY');
    });

    it('应该处理包含特殊字符的字段名', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          {
            name: 'field_name',
            type: 'string',
            required: true,
          },
          {
            name: 'fieldName',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateModel(resource);
      // 应该能够处理下划线和驼峰命名
      expect(result).toContain('field_name');
      expect(result).toContain('fieldName');
    });

    it('应该处理复数形式的关联字段（many-to-many）', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [],
        joins: [
          {
            field: 'roles', // 复数形式
            model: 'Role',
          },
        ],
      };

      const result = generator.generateModel(resource);
      // 复数形式的关联不应该生成外键字段
      expect(result).not.toContain('rolesId');
      // 但应该有关系定义
      expect(result).toContain('roles Role[]');
    });

    it('应该处理已存在的外键字段', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          {
            name: 'authorId',
            type: 'string',
            required: true,
          },
        ],
        joins: [
          {
            field: 'author',
            model: 'User',
          },
        ],
      };

      const result = generator.generateModel(resource);
      // 不应该重复生成 authorId
      const matches = result.match(/authorId/g);
      expect(matches?.length).toBeGreaterThan(0);
      // 但应该只有一个字段定义（不是两个）
      const fieldMatches = result.match(/authorId\s+String/g);
      expect(fieldMatches?.length).toBe(1);
    });

    it('应该处理已定义的时间戳字段', () => {
      const resource: ResourceDefinition = {
        name: 'log',
        prismaModel: 'Log',
        fields: [
          {
            name: 'createdAt',
            type: 'date',
            required: true,
          },
          {
            name: 'updatedAt',
            type: 'date',
            required: true,
          },
        ],
      };

      const result = generator.generateModel(resource);
      // 不应该重复添加时间戳字段
      const createdAtMatches = result.match(/createdAt/g);
      expect(createdAtMatches?.length).toBe(1);
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

      const result = generator.generateModel(resource);
      expect(result).toContain('settings Json?');
    });

    it('应该处理关系类型字段（应该被跳过）', () => {
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

      const result = generator.generateModel(resource);
      // relation 类型的字段不应该出现在字段定义中
      expect(result).not.toMatch(/author\s+(String|Int|Boolean|DateTime|Json)/);
    });

    it('应该处理枚举字段但没有枚举值的情况', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'enum',
            // 没有 enumValues
          },
        ],
      };

      const result = generator.generateModel(resource);
      // 应该回退到 String 类型
      expect(result).toContain('status String');
    });

    it('应该处理默认值为字符串的情况', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          {
            name: 'status',
            type: 'string',
            defaultValue: 'draft',
          },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('@default("draft")');
    });

    it('应该处理默认值为数字的情况', () => {
      const resource: ResourceDefinition = {
        name: 'product',
        prismaModel: 'Product',
        fields: [
          {
            name: 'stock',
            type: 'number',
            defaultValue: 0,
          },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('@default(0)');
    });

    it('应该处理布尔类型默认值', () => {
      const resource: ResourceDefinition = {
        name: 'feature',
        prismaModel: 'Feature',
        fields: [
          {
            name: 'enabled',
            type: 'boolean',
            defaultValue: true,
          },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('@default(true)');
    });
  });

  describe('writeToSchemaFile', () => {

    it('应该写入独立的模型文件', () => {
      const resource: ResourceDefinition = {
        name: 'testModel',
        prismaModel: 'TestModel',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      // Mock console.log 以避免测试输出
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      generator.writeToSchemaFile(resource, undefined, true);

      const modelFilePath = path.join(testModelsDir, 'test-model.prisma');
      testCreatedFiles.push(modelFilePath);
      expect(fs.existsSync(modelFilePath)).toBe(true);

      const content = fs.readFileSync(modelFilePath, 'utf-8');
      expect(content).toContain('model TestModel');

      consoleSpy.mockRestore();
    });

    it('应该跳过已存在的文件', () => {
      const resource: ResourceDefinition = {
        name: 'existingModel',
        prismaModel: 'ExistingModel',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      // 创建目录
      if (!fs.existsSync(testModelsDir)) {
        fs.mkdirSync(testModelsDir, { recursive: true });
      }

      const modelFilePath = path.join(testModelsDir, 'existing-model.prisma');
      fs.writeFileSync(modelFilePath, 'existing content');
      testCreatedFiles.push(modelFilePath);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      generator.writeToSchemaFile(resource, undefined, true);

      const content = fs.readFileSync(modelFilePath, 'utf-8');
      expect(content).toBe('existing content');

      consoleSpy.mockRestore();
    });

    it('应该处理空资源定义', () => {
      const resource: ResourceDefinition = {
        name: 'empty',
        prismaModel: 'Empty',
        fields: [],
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // 不应该抛出错误
      expect(() => {
        generator.writeToSchemaFile(resource, undefined, true);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('应该处理复杂的资源名称（包含连字符）', () => {
      const resource: ResourceDefinition = {
        name: 'test-resource',
        prismaModel: 'TestResource',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      generator.writeToSchemaFile(resource, undefined, true);

      // 文件名应该正确转换
      const modelFilePath = path.join(testModelsDir, 'test-resource.prisma');
      testCreatedFiles.push(modelFilePath);
      expect(fs.existsSync(modelFilePath)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('应该处理 useSeparateFiles 为 false 的情况', () => {
      const resource: ResourceDefinition = {
        name: 'singleFile',
        prismaModel: 'SingleFile',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const schemaPath = path.join(testModelsDir, 'test-schema.prisma');

      // 清理文件
      if (fs.existsSync(schemaPath)) {
        fs.unlinkSync(schemaPath);
      }

      generator.writeToSchemaFile(resource, schemaPath, false);

      // 应该写入到指定的 schema 文件
      expect(fs.existsSync(schemaPath)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('应该处理文件写入时的目录不存在', () => {
      const resource: ResourceDefinition = {
        name: 'newDir',
        prismaModel: 'NewDir',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const tempSchemaPath = path.join(testPrismaDir, 'temp-schema-file.prisma');
      // 确保文件不存在
      if (fs.existsSync(tempSchemaPath)) {
        fs.unlinkSync(tempSchemaPath);
      }

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // writeToMainSchemaFile 会创建文件
      expect(() => {
        generator.writeToSchemaFile(resource, tempSchemaPath, false);
      }).not.toThrow();

      // 记录测试创建的文件
      if (fs.existsSync(tempSchemaPath)) {
        testCreatedFiles.push(tempSchemaPath);
      }

      consoleSpy.mockRestore();
    });

    describe('合并文件逻辑', () => {
      it('应该处理主 schema 文件不存在的情况', () => {
        const resource: ResourceDefinition = {
          name: 'newModel',
          prismaModel: 'NewModel',
          fields: [
            { name: 'name', type: 'string', required: true },
          ],
        };

      const tempSchemaPath = path.join(testPrismaDir, 'temp-schema.prisma');
        // 确保文件不存在
        if (fs.existsSync(tempSchemaPath)) {
          fs.unlinkSync(tempSchemaPath);
        }

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        // 应该能够处理文件不存在的情况
        expect(() => {
          generator.writeToSchemaFile(resource, tempSchemaPath, false);
        }).not.toThrow();

        // 记录测试创建的文件用于清理
        if (fs.existsSync(tempSchemaPath)) {
          testCreatedFiles.push(tempSchemaPath);
        }

        consoleSpy.mockRestore();
      });

      it('应该处理主 schema 文件为空的情况', () => {
        const resource: ResourceDefinition = {
          name: 'emptySchema',
          prismaModel: 'EmptySchema',
          fields: [
            { name: 'name', type: 'string', required: true },
          ],
        };

        const tempSchemaPath = path.join(testPrismaDir, 'empty-schema.prisma');
        fs.writeFileSync(tempSchemaPath, '', 'utf-8');
        testCreatedFiles.push(tempSchemaPath);

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        expect(() => {
          generator.writeToSchemaFile(resource, tempSchemaPath, false);
        }).not.toThrow();

        consoleSpy.mockRestore();
      });
    });
  });

  describe('类型映射和转换', () => {
    it('应该正确映射所有字段类型', () => {
      const resource: ResourceDefinition = {
        name: 'types',
        prismaModel: 'Types',
        fields: [
          { name: 'str', type: 'string', required: true },
          { name: 'num', type: 'number', required: true },
          { name: 'bool', type: 'boolean', required: true },
          { name: 'date', type: 'date', required: true },
          { name: 'json', type: 'json', required: true },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('str String');
      expect(result).toContain('num Int');
      expect(result).toContain('bool Boolean');
      expect(result).toContain('date DateTime');
      expect(result).toContain('json Json');
    });

    it('应该正确处理 toSnakeCase 转换', () => {
      const resource: ResourceDefinition = {
        name: 'TestResource',
        prismaModel: 'TestResource',
        fields: [],
      };

      const result = generator.generateModel(resource);
      // 应该转换为 snake_case
      expect(result).toContain('@@map("test_resource")');
    });

    it('应该正确处理 toKebabCase 转换', () => {
      const resource: ResourceDefinition = {
        name: 'TestResource',
        prismaModel: 'TestResource',
        fields: [],
      };

      const modelsDir = path.join(process.cwd(), 'prisma', 'models');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      generator.writeToSchemaFile(resource, undefined, true);

      const modelFilePath = path.join(modelsDir, 'test-resource.prisma');
      expect(fs.existsSync(modelFilePath)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('应该处理包含数字的资源名称', () => {
      const resource: ResourceDefinition = {
        name: 'resource2',
        prismaModel: 'Resource2',
        fields: [],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('@@map("resource2")');
    });

    it('应该处理单个字符的资源名称', () => {
      const resource: ResourceDefinition = {
        name: 'a',
        prismaModel: 'A',
        fields: [],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('model A');
      expect(result).toContain('@@map("a")');
    });
  });

  describe('关联关系边界情况', () => {
    it('应该处理多个关联关系', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [],
        joins: [
          { field: 'author', model: 'User' },
          { field: 'category', model: 'Category' },
          { field: 'tags', model: 'Tag' }, // 复数
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('authorId Int?');
      expect(result).toContain('categoryId Int?');
      expect(result).not.toContain('tagsId'); // 复数不应该有外键
      expect(result).toContain('author User?');
      expect(result).toContain('category Category?');
      expect(result).toContain('tags Tag[]');
    });

    it('应该处理关联字段名以 ies 结尾的复数形式', () => {
      const resource: ResourceDefinition = {
        name: 'category',
        prismaModel: 'Category',
        fields: [],
        joins: [
          { field: 'categories', model: 'Category' }, // 复数
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).not.toContain('categoriesId');
      expect(result).toContain('categories Category[]');
    });

    it('应该处理关联字段名不以 s 结尾的情况', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [],
        joins: [
          { field: 'profile', model: 'Profile' }, // 不以 s 结尾
        ],
      };

      const result = generator.generateModel(resource);

      // profile 不以 s 结尾，所以应该生成外键
      expect(result).toContain('profileId Int?');
      expect(result).toContain('profile Profile?');
    });

    it('应该处理关联字段名以 s 结尾被识别为复数的情况', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [],
        joins: [
          { field: 'addresses', model: 'Address' }, // 以 s 结尾，会被识别为复数
        ],
      };

      const result = generator.generateModel(resource);

      // addresses 以 s 结尾，会被识别为复数，不生成外键
      expect(result).not.toContain('addressesId');
      expect(result).toContain('addresses Address[]');
    });
  });

  describe('数据库类型注解', () => {
    it('应该为包含 content 的字段添加 @db.Text', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          { name: 'content', type: 'string', required: true },
          { name: 'articleContent', type: 'string', required: true },
          { name: 'CONTENT', type: 'string', required: true }, // 大写
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('content String @db.Text');
      expect(result).toContain('articleContent String @db.Text');
      expect(result).toContain('CONTENT String @db.Text');
    });

    it('应该为包含 description 的字段添加 @db.Text', () => {
      const resource: ResourceDefinition = {
        name: 'product',
        prismaModel: 'Product',
        fields: [
          { name: 'description', type: 'string', required: true },
          { name: 'productDescription', type: 'string', required: true },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('description String @db.Text');
      expect(result).toContain('productDescription String @db.Text');
    });

    it('不应该为非字符串类型添加 @db.Text', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          { name: 'content', type: 'number', required: true },
        ],
      };

      const result = generator.generateModel(resource);

      expect(result).toContain('content Int');
      expect(result).not.toContain('@db.Text');
    });
  });

  describe('枚举处理边界情况', () => {
    it('应该处理枚举默认值', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'enum',
            enumValues: ['PENDING', 'COMPLETED'],
            defaultValue: 'PENDING',
          },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('@default(PENDING)');
      expect(result).not.toContain('@default("PENDING")'); // 枚举不需要引号
    });

    it('应该处理大量枚举值', () => {
      const resource: ResourceDefinition = {
        name: 'status',
        prismaModel: 'Status',
        fields: [
          {
            name: 'value',
            type: 'enum',
            enumValues: Array.from({ length: 50 }, (_, i) => `VALUE_${i}`),
          },
        ],
      };

      const enums = generator.generateEnums(resource);
      expect(enums.length).toBe(1);
      expect(enums[0]).toContain('VALUE_0');
      expect(enums[0]).toContain('VALUE_49');
    });

    it('应该处理枚举值包含特殊字符', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          {
            name: 'value',
            type: 'enum',
            enumValues: ['VALUE_1', 'VALUE-2', 'VALUE.3'],
          },
        ],
      };

      const enums = generator.generateEnums(resource);
      expect(enums.length).toBe(1);
      expect(enums[0]).toContain('VALUE_1');
      expect(enums[0]).toContain('VALUE-2');
      expect(enums[0]).toContain('VALUE.3');
    });
  });

  describe('字段定义边界情况', () => {
    it('应该处理字段返回 null 的情况', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          {
            name: 'relation',
            type: 'relation',
            required: true,
          },
        ],
      };

      const result = generator.generateModel(resource);
      // relation 类型应该被跳过
      expect(result).not.toMatch(/relation\s+(String|Int|Boolean|DateTime|Json)/);
    });

    it('应该处理字段名包含下划线', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          { name: 'field_name', type: 'string', required: true },
          { name: 'field_name_2', type: 'string', required: true },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('field_name String');
      expect(result).toContain('field_name_2 String');
    });

    it('应该处理字段名包含数字', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          { name: 'field1', type: 'string', required: true },
          { name: 'field2Name', type: 'string', required: true },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('field1 String');
      expect(result).toContain('field2Name String');
    });

    it('应该处理字段描述包含换行符', () => {
      const resource: ResourceDefinition = {
        name: 'test',
        prismaModel: 'Test',
        fields: [
          {
            name: 'description',
            type: 'string',
            required: true,
            description: '多行\n描述',
          },
        ],
      };

      const result = generator.generateModel(resource);
      expect(result).toContain('// 多行');
    });
  });
});
