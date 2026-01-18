import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { UserRepository } from './user.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto,
  'users'
> {
  protected readonly modelName = 'users' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
  "id": true,
  "username": true,
  "email": true,
  "nickname": true,
  "avatar": true,
  "status": true
} as const;

  constructor(
    repository: UserRepository,
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
      userRoles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              code: true
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
  async findOne(id: string, options?: any) {
    return super.findOne(id, {
      ...options,
      include: {
      userRoles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }
    },
    });
  }
  protected async beforeCreate(data: CreateUserDto): Promise<any> {
    // TODO: 实现创建前处理逻辑
    return data;
  }

  protected async beforeUpdate(id: string, data: UpdateUserDto): Promise<any> {
    // TODO: 实现更新前处理逻辑
    return data;
  }
  /**
   * 更新记录（包含关系绑定处理）
   */
  async update(id: string, updateDto: UpdateUserDto) {
    // 分离关系绑定字段和普通字段
    const { roleIds, ...updateData } = updateDto as any;

    // 先执行基础更新
    const result = await super.update(id, updateData as UpdateUserDto);

    // 处理关系绑定
    if (roleIds !== undefined) {
      await this.handleUserRolesBinding(id, roleIds);
    }

    return result;
  }

  /**
   * 处理用户角色绑定（多对多关系）
   * @param id 当前记录ID
   * @param roleIds 关联记录ID数组
   */
  private async handleUserRolesBinding(id: string, roleIds: string[]) {
    // 获取当前所有关联记录
    const currentBindings = await this.prisma.userRole.findMany({
      where: {
        userId: id,
      },
    });

    const currentIds = currentBindings.map(b => b.roleId);
    const newIds = roleIds || [];
    
    // 计算需要添加和删除的关联
    const toAdd = newIds.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !newIds.includes(id));

    // 删除不再需要的关联
    if (toRemove.length > 0) {
      await this.prisma.userRole.deleteMany({
        where: {
          userId: id,
          roleId: {
            in: toRemove,
          },
        },
      });
    }

    // 添加新的关联
    if (toAdd.length > 0) {
      await this.prisma.userRole.createMany({
        data: toAdd.map(roleId => ({
          userId: id,
          roleId,
        })),
        skipDuplicates: true,
      });
    }
  }
}
