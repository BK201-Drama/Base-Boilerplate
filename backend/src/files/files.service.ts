import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ExcelUtil } from '../common/utils/excel.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async exportExcel(data: any[], columns: any[], filename: string, res: Response) {
    return ExcelUtil.exportExcel(data, columns, filename, res);
  }

  async importExcel(filePath: string) {
    return ExcelUtil.importExcel(filePath);
  }

  async getExportData(query: any) {
    // 示例：获取用户数据用于导出
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        createdAt: true,
      },
    });
    return users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
  }
}



