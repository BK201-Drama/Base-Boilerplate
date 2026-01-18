import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RoleController],
  providers: [RoleRepository, RoleService],
  exports: [RoleService],
})
export class RoleModule {}
