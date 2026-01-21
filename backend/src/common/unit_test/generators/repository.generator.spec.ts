import { RepositoryGenerator } from '../../generator/generators/repository.generator';
import { ResourceDefinition } from '../../generator/types/resource.types';

describe('RepositoryGenerator', () => {
  let generator: RepositoryGenerator;

  beforeEach(() => {
    generator = new RepositoryGenerator();
  });

  describe('generateRepository', () => {
    it('应该生成基本的 Repository 类', () => {
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

      const result = generator.generateRepository(resource);

      expect(result).toContain('@Injectable()');
      expect(result).toContain('export class UserRepository extends BaseCrudRepository');
      expect(result).toContain('User');
      expect(result).toContain('PrismaService');
      expect(result).toContain('getModelDelegate()');
      expect(result).toContain('prisma.user');
    });

    it('应该生成包含 defaultSelect 的 Repository', () => {
      const resource: ResourceDefinition = {
        name: 'post',
        prismaModel: 'Post',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
            includeInList: true,
          },
          {
            name: 'content',
            type: 'string',
            required: true,
            includeInList: false,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('defaultSelect');
      expect(result).toContain('"id": true');
      expect(result).toContain('"title": true');
      expect(result).not.toContain('"content": true'); // includeInList 为 false
    });

    it('应该生成包含 status 字段的自动方法', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        fields: [
          {
            name: 'status',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('updateStatus');
      expect(result).toContain('async updateStatus(id: number, status: string)');
    });

    it('应该生成包含 isActive 字段的自动方法', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        fields: [
          {
            name: 'isActive',
            type: 'boolean',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('activate');
      expect(result).toContain('deactivate');
      expect(result).toContain('toggleActive');
    });

    it('应该生成包含 deletedAt 字段的软删除方法', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          {
            name: 'deletedAt',
            type: 'date',
            required: false,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('softDelete');
      expect(result).toContain('restore');
      expect(result).toContain('findActive');
    });

    it('应该生成包含 isDeleted 字段的软删除方法', () => {
      const resource: ResourceDefinition = {
        name: 'comment',
        prismaModel: 'Comment',
        fields: [
          {
            name: 'isDeleted',
            type: 'boolean',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('softDelete');
      expect(result).toContain('restore');
      expect(result).toContain('findActive');
    });

    it('应该生成包含 enabled 字段的方法', () => {
      const resource: ResourceDefinition = {
        name: 'feature',
        prismaModel: 'Feature',
        fields: [
          {
            name: 'enabled',
            type: 'boolean',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('enable');
      expect(result).toContain('disable');
    });

    it('应该使用自定义 defaultPageSize', () => {
      const resource: ResourceDefinition = {
        name: 'product',
        prismaModel: 'Product',
        defaultPageSize: 20,
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('defaultPageSize = 20');
    });

    it('应该排除 password 字段从 defaultSelect', () => {
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
            name: 'password',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).not.toContain('password: true');
    });

    it('应该使用自定义 defaultSelect', () => {
      const resource: ResourceDefinition = {
        name: 'order',
        prismaModel: 'Order',
        defaultSelect: {
          id: true,
          total: true,
        },
        fields: [
          {
            name: 'total',
            type: 'number',
            required: true,
          },
        ],
      };

      const result = generator.generateRepository(resource);

      expect(result).toContain('defaultSelect = {');
      expect(result).toContain('"id": true');
      expect(result).toContain('"total": true');
    });
  });
});
