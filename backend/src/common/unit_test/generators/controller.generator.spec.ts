import { ControllerGenerator } from '../../generator/generators/controller.generator';
import { ResourceDefinition } from '../../generator/types/resource.types';

describe('ControllerGenerator', () => {
  let generator: ControllerGenerator;

  beforeEach(() => {
    generator = new ControllerGenerator();
  });

  describe('generateController', () => {
    it('应该生成基本的 Controller 类', () => {
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

      const result = generator.generateController(resource);

      expect(result).toContain('@Controller(\'users\')');
      expect(result).toContain('export class UserController');
      expect(result).toContain('UserService');
      expect(result).toContain('CreateUserDto');
      expect(result).toContain('UpdateUserDto');
    });

    it('应该生成包含所有 CRUD 操作的 Controller', () => {
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
        operations: {
          create: true,
          read: true,
          update: true,
          delete: true,
          list: true,
        },
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Post()');
      expect(result).toContain('@Get()');
      expect(result).toContain('@Get(\':id\')');
      expect(result).toContain('@Patch(\':id\')');
      expect(result).toContain('@Delete(\':id\')');
    });

    it('应该生成包含权限控制的 Controller', () => {
      const resource: ResourceDefinition = {
        name: 'article',
        prismaModel: 'Article',
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
          },
        ],
        permissions: {
          resource: 'article',
          requireAuth: true,
          createRoles: ['admin'],
          updateRoles: ['admin', 'editor'],
          deleteRoles: ['admin'],
        },
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@UseGuards(JwtAuthGuard)');
      expect(result).toContain('@Permissions(\'article:create\')');
      expect(result).toContain('@Roles(\'admin\')');
    });

    it('应该生成包含批量删除的 Controller', () => {
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
        operations: {
          batchDelete: true,
        },
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Delete(\'batch\')');
      expect(result).toContain('batchDelete');
    });

    it('应该生成包含自定义端点的 Controller', () => {
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

      const result = generator.generateController(resource);

      expect(result).toContain('@Get(\'stats\')');
      expect(result).toContain('getStats');
    });

    it('应该生成包含关系绑定端点的 Controller', () => {
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
            generateStandaloneEndpoints: true,
            junctionModel: 'UserRole',
            currentModelForeignKey: 'userId',
            relatedModelForeignKey: 'roleId',
          },
        ],
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Post(\':id/bind-roles\')');
      expect(result).toContain('@Delete(\':id/unbind-roles/:relatedId\')');
    });

    it('应该使用自定义路径', () => {
      const resource: ResourceDefinition = {
        name: 'user',
        prismaModel: 'User',
        path: 'members',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Controller(\'members\')');
    });

    it('应该禁用某些操作', () => {
      const resource: ResourceDefinition = {
        name: 'log',
        prismaModel: 'Log',
        fields: [
          {
            name: 'message',
            type: 'string',
            required: true,
          },
        ],
        operations: {
          create: false,
          update: false,
          delete: false,
        },
      };

      const result = generator.generateController(resource);

      expect(result).not.toContain('@Post()');
      expect(result).not.toContain('@Patch(\':id\')');
      expect(result).not.toContain('@Delete(\':id\')');
      expect(result).toContain('@Get()');
      expect(result).toContain('@Get(\':id\')');
    });

    it('应该处理 requireAuth 为 false 的情况', () => {
      const resource: ResourceDefinition = {
        name: 'public',
        prismaModel: 'Public',
        fields: [
          {
            name: 'content',
            type: 'string',
            required: true,
          },
        ],
        permissions: {
          resource: 'public',
          requireAuth: false,
        },
      };

      const result = generator.generateController(resource);

      expect(result).not.toContain('@UseGuards(JwtAuthGuard)');
    });

    it('应该处理空权限配置', () => {
      const resource: ResourceDefinition = {
        name: 'open',
        prismaModel: 'Open',
        fields: [
          {
            name: 'data',
            type: 'string',
            required: true,
          },
        ],
        // 没有 permissions 配置
      };

      const result = generator.generateController(resource);

      // 应该使用默认权限配置
      expect(result).toContain('@UseGuards(JwtAuthGuard)');
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理空字段数组', () => {
      const resource: ResourceDefinition = {
        name: 'empty',
        prismaModel: 'Empty',
        fields: [],
      };

      expect(() => {
        generator.generateController(resource);
      }).not.toThrow();
    });

    it('应该处理所有操作都被禁用的情况', () => {
      const resource: ResourceDefinition = {
        name: 'readonly',
        prismaModel: 'Readonly',
        fields: [
          {
            name: 'data',
            type: 'string',
            required: true,
          },
        ],
        operations: {
          create: false,
          read: false,
          update: false,
          delete: false,
          list: false,
        },
      };

      const result = generator.generateController(resource);

      // 应该仍然生成 Controller 类
      expect(result).toContain('export class ReadonlyController');
      // 但应该没有 CRUD 端点
      expect(result).not.toContain('@Post()');
      expect(result).not.toContain('@Get()');
    });

    it('应该处理空的自定义端点数组', () => {
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
        customEndpoints: [],
      };

      const result = generator.generateController(resource);

      expect(result).toContain('export class SimpleController');
      // 空数组不应该生成自定义端点方法
      // 检查是否没有自定义端点的方法体（通过检查是否有 TODO 注释）
      expect(result).not.toContain('// TODO: 实现自定义接口逻辑');
    });

    it('应该处理多个自定义端点', () => {
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
            serviceMethod: 'getStats',
          },
          {
            path: 'export',
            method: 'post',
            serviceMethod: 'exportOrders',
          },
        ],
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Get(\'stats\')');
      expect(result).toContain('@Post(\'export\')');
    });

    it('应该处理自定义端点需要不同权限的情况', () => {
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
        permissions: {
          resource: 'order',
          requireAuth: true,
        },
        customEndpoints: [
          {
            path: 'public',
            method: 'get',
            requireAuth: false,
            serviceMethod: 'getPublic',
          },
        ],
      };

      const result = generator.generateController(resource);

      // 类级别有 JwtAuthGuard，但自定义端点不需要
      expect(result).toContain('@UseGuards(JwtAuthGuard)');
      // 自定义端点应该有自己的权限配置
      expect(result).toContain('@Get(\'public\')');
    });

    it('应该处理关系绑定但没有独立端点', () => {
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
            generateStandaloneEndpoints: false, // 不生成独立端点
            junctionModel: 'UserRole',
            currentModelForeignKey: 'userId',
            relatedModelForeignKey: 'roleId',
          },
        ],
      };

      const result = generator.generateController(resource);

      // 不应该有独立的绑定端点
      expect(result).not.toContain('@Post(\':id/bind-roles\')');
    });

    it('应该处理一对一关系的绑定端点', () => {
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
            generateStandaloneEndpoints: true,
            foreignKeyField: 'userId',
          },
        ],
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Post(\':id/set-user\')');
      expect(result).toContain('@Delete(\':id/unbind-user\')');
    });

    it('应该处理空角色数组', () => {
      const resource: ResourceDefinition = {
        name: 'public',
        prismaModel: 'Public',
        fields: [
          {
            name: 'content',
            type: 'string',
            required: true,
          },
        ],
        permissions: {
          resource: 'public',
          requireAuth: true,
          createRoles: [],
          updateRoles: [],
          deleteRoles: [],
        },
      };

      const result = generator.generateController(resource);

      // 应该不包含 @Roles 装饰器
      expect(result).not.toMatch(/@Roles\(/);
      // 但应该有权限装饰器
      expect(result).toContain('@Permissions');
    });

    it('应该处理复数资源名称', () => {
      const resource: ResourceDefinition = {
        name: 'person',
        pluralName: 'people',
        prismaModel: 'Person',
        fields: [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
        ],
      };

      const result = generator.generateController(resource);

      expect(result).toContain('@Controller(\'people\')');
    });
  });
});
