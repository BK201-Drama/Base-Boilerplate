import { ServiceGenerator } from '../../generator/generators/service.generator';
import { ResourceDefinition } from '../../generator/types/resource.types';

describe('ServiceGenerator', () => {
  let generator: ServiceGenerator;

  beforeEach(() => {
    generator = new ServiceGenerator();
  });

  describe('generateService', () => {
    it('应该生成基本的 Service 类', () => {
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

      const result = generator.generateService(resource);

      expect(result).toContain('@Injectable()');
      expect(result).toContain('export class UserService extends BaseCrudService');
      expect(result).toContain('UserRepository');
      expect(result).toContain('I18nService');
      expect(result).toContain('CreateUserDto');
      expect(result).toContain('UpdateUserDto');
    });

    it('应该生成包含关联查询方法的 Service', () => {
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
            joinStrategy: 'sql',
          },
        ],
      };

      const result = generator.generateService(resource);

      expect(result).toContain('findAll');
      expect(result).toContain('findOne');
      expect(result).toContain('include');
    });

    it('应该生成包含内存拼接策略的 Service', () => {
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
        ],
      };

      const result = generator.generateService(resource);

      expect(result).toContain('UserRepository');
      expect(result).toContain('内存拼接');
      expect(result).toContain('findByIds');
    });

    it('应该生成包含生命周期钩子的 Service', () => {
      const resource: ResourceDefinition = {
        name: 'product',
        prismaModel: 'Product',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
        hooks: {
          beforeCreate: true,
          afterCreate: true,
          beforeUpdate: true,
          afterUpdate: true,
          beforeDelete: true,
        },
      };

      const result = generator.generateService(resource);

      expect(result).toContain('beforeCreate');
      expect(result).toContain('afterCreate');
      expect(result).toContain('beforeUpdate');
      expect(result).toContain('afterUpdate');
      expect(result).toContain('beforeDelete');
    });

    it('应该生成包含关系绑定方法的 Service', () => {
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

      const result = generator.generateService(resource);

      expect(result).toContain('PrismaService');
      expect(result).toContain('handleRolesBinding');
      expect(result).toContain('update');
      expect(result).toContain('userRole'); // Prisma 模型名是小写开头的
    });

    it('应该生成包含一对一关系绑定的 Service', () => {
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

      const result = generator.generateService(resource);

      expect(result).toContain('handleUserBinding');
      expect(result).toContain('userId');
    });

    it('应该生成包含自定义端点方法的 Service', () => {
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
        customEndpoints: [
          {
            path: 'stats',
            method: 'get',
            description: '获取订单统计',
            serviceMethod: 'getStats',
          },
        ],
      };

      const result = generator.generateService(resource);

      expect(result).toContain('getStats');
      expect(result).toContain('获取订单统计');
    });

    it('应该生成包含嵌套关联的 Service', () => {
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
            joinStrategy: 'sql',
            nested: [
              {
                field: 'author',
                model: 'User',
                joinStrategy: 'sql',
              },
            ],
          },
        ],
      };

      const result = generator.generateService(resource);

      expect(result).toContain('include');
      expect(result).toContain('post');
      expect(result).toContain('author');
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

      const result = generator.generateService(resource);

      expect(result).toContain('defaultPageSize = 20');
    });

    it('应该生成包含 select 字段的关联查询', () => {
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
            joinStrategy: 'sql',
            select: ['id', 'name', 'email'],
          },
        ],
      };

      const result = generator.generateService(resource);

      expect(result).toContain('select');
      expect(result).toContain('id: true');
      expect(result).toContain('name: true');
      expect(result).toContain('email: true');
    });

    it('应该处理 includeInList 和 includeInDetail 配置', () => {
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
            joinStrategy: 'sql',
            includeInList: true,
            includeInDetail: true,
          },
          {
            field: 'comments',
            model: 'Comment',
            joinStrategy: 'sql',
            includeInList: false,
            includeInDetail: true,
          },
        ],
      };

      const result = generator.generateService(resource);

      // 应该为 list 和 detail 生成不同的 include 配置
      expect(result).toContain('findAll');
      expect(result).toContain('findOne');
    });
  });
});
