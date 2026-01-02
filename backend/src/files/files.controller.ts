import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { FileUtil } from '../common/utils/file.util';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private filesService: FilesService,
    private configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
          FileUtil.ensureDirectoryExists(uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = FileUtil.generateUniqueFileName(file.originalname);
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: this.configService.get<number>('MAX_FILE_SIZE') || 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
        if (FileUtil.isAllowedFileType(file.originalname, allowedTypes)) {
          cb(null, true);
        } else {
          cb(new Error('不支持的文件类型'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/files/download/${file.filename}`,
    };
  }

  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
    const filePath = path.join(uploadPath, filename);
    return res.download(filePath);
  }

  @Get('export/excel')
  async exportExcel(@Query() query: any, @Res() res: Response) {
    // 示例：导出用户数据
    const data = await this.filesService.getExportData(query);
    const columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: '用户名', key: 'username', width: 20 },
      { header: '邮箱', key: 'email', width: 30 },
      { header: '昵称', key: 'nickname', width: 20 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];
    const filename = `export-${Date.now()}`;
    await this.filesService.exportExcel(data, columns, filename, res);
  }

  @Post('import/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
          FileUtil.ensureDirectoryExists(uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = FileUtil.generateUniqueFileName(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    const data = await this.filesService.importExcel(file.path);
    return {
      message: '导入成功',
      total: data.length,
      data,
    };
  }
}



