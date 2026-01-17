import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/services/base-crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class UsersService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto,
  'users'
> {
  protected readonly modelName = 'users' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
    id: true,
    username: true,
    email: true,
    nickname: true,
    avatar: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }

  protected async beforeCreate(data: CreateUserDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return {
      ...data,
      password: hashedPassword,
    };
  }

  protected async beforeUpdate(id: string, data: UpdateUserDto): Promise<any> {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return updateData;
  }

  /**
   * 重写 findAll 方法以包含 userRoles 关系
   */
  async findAll(page: number = 1, limit: number = 10) {
    return super.findAll(
      { page, limit },
      {
        select: {
          id: true,
          username: true,
          email: true,
          nickname: true,
          avatar: true,
          status: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      },
    );
  }

  /**
   * 重写 findOne 方法以包含完整的角色和权限信息
   */
  async findOne(id: string) {
    return super.findOne(id, {
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                        resource: true,
                        action: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
