import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { PermissionRepository } from './permission.repository';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionService extends BaseCrudService<
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  'permissions'
> {
  protected readonly modelName = 'permissions' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
  "id": true,
  "name": true,
  "code": true,
  "resource": true,
  "action": true
} as const;

  constructor(
    repository: PermissionRepository,
    i18n: I18nService
  ) {
    super(repository, i18n);
  }

}
