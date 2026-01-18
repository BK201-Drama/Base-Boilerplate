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

  /**
   * 更新角色（包含权限绑定）
   */
  async update(id: number, updateDto: UpdateRoleDto): Promise<Role> {
    const { permissionIds, ...updateData } = updateDto as any;

    // 先更新基本数据
    const updated = await super.update(id, updateData as UpdateRoleDto);

    // 处理权限绑定
    if (permissionIds !== undefined) {
      await this.handleRolePermissionsBinding(id, permissionIds);
    }

    // 返回更新后的完整数据（包含关联）
    return this.findOne(id);
  }

  /**
   * 绑定角色权限关系
   * @param id 角色ID
   * @param permissionIds 关联记录ID数组
   */
  private async handleRolePermissionsBinding(id: number, permissionIds: number[]) {
    // 获取当前所有关联记录
    const currentBindings = await this.prisma.rolePermission.findMany({
      where: {
        roleId: id,
      },
    });

    const currentIds = currentBindings.map((b) => b.permissionId);
    const newIds = permissionIds || [];

    // 计算需要删除和添加的ID
    const toDelete = currentIds.filter((id) => !newIds.includes(id));
    const toAdd = newIds.filter((id) => !currentIds.includes(id));

    // 删除不再需要的关联
    if (toDelete.length > 0) {
      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId: id,
          permissionId: { in: toDelete },
        },
      });
    }

    // 添加新的关联
    if (toAdd.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: toAdd.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }
}
