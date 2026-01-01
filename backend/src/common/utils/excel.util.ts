import * as ExcelJS from 'exceljs';
import { Response } from 'express';

export class ExcelUtil {
  /**
   * 导出 Excel
   * @param data 数据数组
   * @param columns 列配置 [{ header: '列名', key: '字段名', width: 20 }]
   * @param filename 文件名
   * @param res Express Response 对象
   */
  static async exportExcel(
    data: any[],
    columns: Array<{ header: string; key: string; width?: number }>,
    filename: string,
    res: Response,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 设置列
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 添加数据
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}.xlsx`);

    // 写入响应
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * 导入 Excel
   * @param filePath 文件路径
   * @returns 数据数组
   */
  static async importExcel(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 跳过表头

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const headerCell = worksheet.getRow(1).getCell(colNumber);
        if (headerCell.value) {
          rowData[headerCell.value.toString()] = cell.value;
        }
      });
      data.push(rowData);
    });

    return data;
  }
}


