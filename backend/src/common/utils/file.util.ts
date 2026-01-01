import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class FileUtil {
  /**
   * 确保目录存在
   */
  static ensureDirectoryExists(dirPath: string) {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 生成唯一文件名
   */
  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * 获取文件扩展名
   */
  static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  /**
   * 检查文件类型是否允许
   */
  static isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
    const ext = this.getFileExtension(filename);
    return allowedTypes.includes(ext);
  }
}


