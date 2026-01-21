import { ModuleGenerator } from '../../generator/generators/module.generator';
import { ResourceDefinition } from '../../generator/types/resource.types';

describe('ModuleGenerator', () => {
  let generator: ModuleGenerator;

  beforeEach(() => {
    generator = new ModuleGenerator();
  });

  describe('generateModule', () => {
    it('应该生成基本的 Module 类', () => {
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

      const result = generator.generateModule(resource);

      expect(result).toContain('@Module({');
      expect(result).toContain('export class UserModule');
      expect(result).toContain('UserService');
      expect(result).toContain('UserController');
      expect(result).toContain('UserRepository');
      expect(result).toContain('PrismaModule');
    });

    it('应该生成包含导入的 Module', () => {
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

      const result = generator.generateModule(resource);

      expect(result).toContain('import { Module } from \'@nestjs/common\'');
      expect(result).toContain('import { PrismaModule }');
      expect(result).toContain('import { PostService }');
      expect(result).toContain('import { PostController }');
      expect(result).toContain('import { PostRepository }');
    });

    it('应该生成包含内存拼接策略所需模块的 Module', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'total',
            type: 'number',
            required: true,
          },
        ],
        joins: [
          {
            field: 'user',
            model: 'User',
            joinStrategy: 'memory',
          },
          {
            field: 'products',
            model: 'Product',
            joinStrategy: 'sql',
          },
        ],
      };

      const result = generator.generateModule(resource);

      expect(result).toContain('UserModule');
      expect(result).toContain('import { UserModule }');
      expect(result).not.toContain('ProductModule'); // SQL 策略不需要导入模块
    });

    it('应该生成包含嵌套关联所需模块的 Module', () => {
      const resource: ResourceDefinition = {
        name: 'comment',
        prismaModel: 'Comment',
        fields: [
          {
            name: 'content',
            type: 'string',
            required: true,
          },
        ],
        joins: [
          {
            field: 'post',
            model: 'Post',
            joinStrategy: 'memory',
            nested: [
              {
                field: 'author',
                model: 'User',
                joinStrategy: 'memory',
              },
            ],
          },
        ],
      };

      const result = generator.generateModule(resource);

      expect(result).toContain('PostModule');
      expect(result).toContain('UserModule');
    });

    it('应该正确配置 providers 和 controllers', () => {
      const resource: ResourceDefinition = {
        name: 'category',
        prismaModel: 'Category',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateModule(resource);

      expect(result).toContain('controllers: [CategoryController]');
      expect(result).toContain('providers: [CategoryRepository, CategoryService]');
      expect(result).toContain('exports: [CategoryService]');
    });

    it('应该处理没有关联的简单资源', () => {
      const resource: ResourceDefinition = {
        name: 'tag',
        prismaModel: 'Tag',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateModule(resource);

      expect(result).toContain('imports: [PrismaModule]');
      // 检查没有额外的模块导入
      expect(result).not.toMatch(/imports: \[PrismaModule,\s*\w+Module/);
    });
  });
});
