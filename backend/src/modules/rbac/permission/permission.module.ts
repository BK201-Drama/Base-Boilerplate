import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionController],
  providers: [PermissionRepository, PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
