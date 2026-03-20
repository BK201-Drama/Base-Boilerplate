import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/permissions';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * User CRUD Controller
 *
 * 自动生成的 CRUD 控制器，提供以下端点：
 * - POST /users - 创建
 * - GET /users - 分页列表
 * - GET /users/:id - 详情
 * - PATCH /users/:id - 更新
 * - DELETE /users/:id - 删除
 *
 * 注意：你可以在本类中添加自定义方法，例如：
 * ```typescript
 * @Get('custom-endpoint')
 * @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 * @Permissions('user:read')
 * customMethod(@Param('id') id: string) {
 *   return this.userService.customMethod(id);
 * }
 * ```
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  
  @Permissions(PERMISSIONS.USER_CREATE)
  create(@Body() createDto: CreateUserDto) {
    return this.userService.create(createDto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_READ)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.userService.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_READ)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  
  @Permissions(PERMISSIONS.USER_UPDATE)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserDto) {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_DELETE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
