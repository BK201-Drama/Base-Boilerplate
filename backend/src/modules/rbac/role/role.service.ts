import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { RoleRepository } from './role.repository';
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
  "id": true
} as const;

  constructor(
    repository: RoleRepository,
    i18n: I18nService
  ) {
    super(repository, i18n);
  }

}
