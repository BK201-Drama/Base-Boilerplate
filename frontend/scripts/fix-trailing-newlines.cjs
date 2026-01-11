#!/usr/bin/env node

/**
 * 修复文件末尾多余的空行
 * 
 * 确保每个文件末尾只有一个换行符（POSIX 标准）
 */

const fs = require('fs');
const path = require('path');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext);
}

function shouldIgnoreDir(dirName) {
  return IGNORE_DIRS.includes(dirName);
}

function fixTrailingNewlines(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 移除末尾的所有空白字符（包括换行符）
    content = content.replace(/[\r\n\s]+$/, '');

    // 确保文件末尾有一个换行符（POSIX 标准）
    if (content.length > 0) {
      content += '\n';
    }

    // 只有内容改变时才写入
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldIgnoreDir(file)) {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile()) {
      if (shouldProcessFile(filePath)) {
        callback(filePath);
      }
    }
  }
}

function main() {
  const srcDir = path.join(__dirname, '../src');
  let fixedCount = 0;
  let totalCount = 0;

  console.log('🔧 开始修复文件末尾多余的空行...\n');

  walkDir(srcDir, (filePath) => {
    totalCount++;
    if (fixTrailingNewlines(filePath)) {
      fixedCount++;
      console.log(`✅ 修复: ${path.relative(srcDir, filePath)}`);
    }
  });

  console.log(`\n✨ 完成！修复了 ${fixedCount}/${totalCount} 个文件`);
}

main();

