import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { RoleRepository } from './role.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService extends BaseCrudService<
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  'roles'
> {
  protected readonly modelName = 'roles' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
  "id": true,
  "name": true,
  "code": true
} as const;

  constructor(
    repository: RoleRepository,
    i18n: I18nService,
    private readonly prisma: PrismaService
  ) {
    super(repository, i18n);
  }

  /**
   * 分页查询（包含关联数据，使用 SQL JOIN）
   */
  async findAll(pagination?: { page?: number; limit?: number }, options?: any) {
    return super.findAll(pagination, {
      ...options,
      include: {
      rolePermissions: {
        include: {
          permission: {
            select: {
              id: true,
              name: true,
              code: true,
              resource: true,
              action: true
            }
          }
        }
      }
    },
    });
  }

  /**
   * 根据ID查询（包含关联数据，使用 SQL JOIN）
   */
  async findOne(id: number, options?: any) {
    return super.findOne(id, {
      ...options,
      include: {
      rolePermissions: {
        include: {
          permission: {
            select: {
              id: true,
              name: true,
              code: true,
              resource: true,
              action: true
            }
          }
        }
      }
    },
    });
  }
  protected async beforeCreate(data: CreateRoleDto): Promise<any> {
    // TODO: 实现创建前处理逻辑
    return data;
  }

  protected async beforeUpdate(id: number, data: UpdateRoleDto): Promise<any> {
    // TODO: 实现更新前处理逻辑
    return data;
  }
  /**
   * 更新记录（包含关系绑定处理）
   */
  async update(id: number, updateDto: UpdateRoleDto) {
    // 分离关系绑定字段和普通字段
    const { permissionIds, ...updateData } = updateDto as any;

    // 先执行基础更新
    const result = await super.update(id, updateData as UpdateRoleDto);

    // 处理关系绑定
    if (permissionIds !== undefined) {
      await this.handleRolePermissionsBinding(id, permissionIds);
    }

    return result;
  }

  /**
   * 处理角色权限绑定（多对多关系）
   * @param id 当前记录ID
   * @param permissionIds 关联记录ID数组
   */
  private async handleRolePermissionsBinding(id: number, permissionIds: number[]) {
    // 获取当前所有关联记录
    const currentBindings = await this.prisma.rolePermission.findMany({
      where: {
        roleId: id,
      },
    });

    const currentIds = currentBindings.map(b => b.permissionId);
    const newIds = permissionIds || [];
    
    // 计算需要添加和删除的关联
    const toAdd = newIds.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !newIds.includes(id));

    // 删除不再需要的关联
    if (toRemove.length > 0) {
      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId: id,
          permissionId: {
            in: toRemove,
          },
        },
      });
    }

    // 添加新的关联
    if (toAdd.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: toAdd.map(permissionId => ({
          roleId: id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }
}
