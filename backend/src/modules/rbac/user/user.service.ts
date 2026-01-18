import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { UserRepository } from './user.repository';
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
  "id": true
} as const;

  constructor(
    repository: UserRepository,
    i18n: I18nService
  ) {
    super(repository, i18n);
  }

}
