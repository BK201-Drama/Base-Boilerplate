/**
 * Schema 编译器
 * 从 TypeScript 模型定义或 Prisma 文件生成完整的 schema.prisma
 * 自动生成关联表（junction tables）
 */

import * as path from 'path';
import * as fs from 'fs';
import { ModelDefinition, RelationDefinition, JunctionTableConfig, IndexDefinition } from '../types/model.types';

export interface CompiledModel {
  name: string;
  content: string;
  enums: string[];
  junctionTables: JunctionTableConfig[];
}

export class SchemaCompiler {
  private modelsDir: string;
  private schemaPath: string;
  private models: Map<string, ModelDefinition> = new Map();
  private compiledModels: Map<string, CompiledModel> = new Map();
  private allJunctionTables: Map<string, JunctionTableConfig> = new Map();

  constructor() {
    this.modelsDir = path.join(process.cwd(), 'prisma', 'models');
    this.schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  }

  /**
   * 编译所有模型并生成 schema.prisma
   */
  async compile(): Promise<void> {
    console.log('🔍 扫描模型文件...');
    
    // 1. 加载所有模型定义
    await this.loadModels();
    
    // 2. 先收集所有关联表（确保在编译任何模型之前，所有关联表都已收集）
    console.log('🔗 收集关联表...');
    for (const [name, model] of this.models) {
      if (model.relations) {
        for (const relation of model.relations) {
          if (relation.type === 'many-to-many' && relation.junctionTable) {
            const junctionKey = relation.junctionTable.name.toLowerCase();
            if (!this.allJunctionTables.has(junctionKey)) {
              this.allJunctionTables.set(junctionKey, relation.junctionTable);
            }
          }
        }
      }
    }
    
    // 3. 编译每个模型
    console.log('📝 编译模型定义...');
    for (const [name, model] of this.models) {
      this.compileModel(name, model);
    }
    
    // 4. 生成关联表
    console.log('🔗 生成关联表...');
    this.generateJunctionTables();
    
    // 5. 合并到 schema.prisma
    console.log('📋 合并到 schema.prisma...');
    this.mergeToSchema();
    
    console.log('✅ Schema 编译完成！');
  }

  /**
   * 加载所有模型定义（从 .model.ts 或 .prisma 文件）
   */
  private async loadModels(): Promise<void> {
    if (!fs.existsSync(this.modelsDir)) {
      console.warn(`⚠️  模型目录不存在: ${this.modelsDir}`);
      return;
    }

    const files = fs.readdirSync(this.modelsDir);
    
    // 先加载 TypeScript 模型定义
    for (const file of files) {
      if (file.endsWith('.model.ts') && !file.endsWith('decorators.model.ts')) {
        const modelPath = path.join(this.modelsDir, file);
        try {
          // 动态导入 TypeScript 文件
          delete require.cache[require.resolve(modelPath)];
          const modelModule = require(modelPath);
          
          // 尝试从装饰器类中提取模型定义
          let model: ModelDefinition | null = null;
          
          // 检查是否是装饰器类（导出的是类）
          const exportedClass = modelModule.default || Object.values(modelModule).find(
            (exp: any) => typeof exp === 'function' && exp.prototype && exp.name
          );
          
          if (exportedClass && typeof exportedClass === 'function' && exportedClass.name) {
            // 尝试从装饰器中提取
            try {
              const decoratorsPath = path.join(process.cwd(), 'src', 'common', 'generator', 'decorators', 'index.ts');
              if (fs.existsSync(decoratorsPath)) {
                delete require.cache[require.resolve(decoratorsPath)];
                const { extractModelDefinition } = require(decoratorsPath);
                model = extractModelDefinition(exportedClass);
                
                // 如果提取成功，尝试从模块中提取枚举
                if (model) {
                  // 查找模块中导出的枚举（以 Enum 结尾的导出）
                  const enumExports = Object.entries(modelModule).filter(
                    ([key, value]: [string, any]) => 
                      key.endsWith('Enum') && typeof value === 'object' && value !== null
                  );
                  
                  if (enumExports.length > 0 && (!model.enums || model.enums.length === 0)) {
                    model.enums = enumExports.map(([enumName, enumObj]: [string, any]) => ({
                      name: enumName,
                      values: Object.values(enumObj).filter(v => typeof v === 'string') as string[],
                    }));
                  }
                }
              }
            } catch (e) {
              // 如果提取失败，继续尝试作为配置对象
            }
          }
          
          // 如果不是装饰器类，尝试作为配置对象
          if (!model) {
            model = modelModule.default || modelModule;
          }
          
          if (model && model.name) {
            this.models.set(model.name, model);
            console.log(`  ✅ 加载模型: ${model.name} (${file})`);
          }
        } catch (error) {
          console.warn(`  ⚠️  无法加载模型文件 ${file}:`, error.message);
        }
      }
    }

    // 注意：优先使用 TypeScript 模型定义文件（.model.ts）
    // 如果存在对应的 .model.ts 文件，则忽略 .prisma 文件
    // 只有在没有 TypeScript 定义时才解析 .prisma 文件
    console.log('  ℹ️  提示：优先使用 TypeScript 模型定义文件（.model.ts）');
    console.log('  ℹ️  如果存在 .model.ts 文件，对应的 .prisma 文件将被忽略\n');
  }

  /**
   * 解析 Prisma 文件，提取模型定义
   * 注意：这个解析器比较简单，建议使用 TypeScript 模型定义文件
   */
  private parsePrismaFile(content: string, filename: string): ModelDefinition | null {
    // 简单的 Prisma 解析（可以后续增强）
    const modelMatch = content.match(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/);
    if (!modelMatch) {
      return null;
    }

    const modelName = modelMatch[1];
    const modelBody = modelMatch[2];
    
    // 提取字段（更精确的正则）
    const fields: any[] = [];
    // 匹配字段定义：字段名 类型? @属性
    const fieldLines = modelBody.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@');
    });
    
    for (const line of fieldLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // 跳过关系字段（包含模型名称的字段）
      if (trimmed.match(/^\w+\s+\w+\[\]?$/)) {
        continue;
      }
      
      // 解析字段：name type? @attributes
      const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\?)?\s*(.*)$/);
      if (fieldMatch) {
        const [, fieldName, fieldType, optional, attributes] = fieldMatch;
        
        // 跳过 id、createdAt、updatedAt（会自动生成）
        if (fieldName === 'id' || fieldName === 'createdAt' || fieldName === 'updatedAt') {
          continue;
        }
        
        fields.push({
          name: fieldName,
          type: fieldType,
          optional: !!optional,
          unique: attributes.includes('@unique'),
          default: this.extractDefault(attributes),
          dbType: this.extractDbType(attributes),
        });
      }
    }

    // 提取表名映射
    const mapMatch = modelBody.match(/@@map\("(\w+)"\)/);
    const tableName = mapMatch ? mapMatch[1] : undefined;

    return {
      name: modelName,
      tableName,
      fields,
      relations: [], // 从 Prisma 文件中提取关系比较复杂，建议使用 TypeScript 定义
    };
  }

  /**
   * 提取数据库类型
   */
  private extractDbType(attributes: string): string | undefined {
    const dbTypeMatch = attributes.match(/@db\.(\w+)(?:\([^)]+\))?/);
    return dbTypeMatch ? `@db.${dbTypeMatch[1]}` : undefined;
  }

  /**
   * 提取默认值
   */
  private extractDefault(attributes: string): string | undefined {
    const defaultMatch = attributes.match(/@default\(([^)]+)\)/);
    return defaultMatch ? defaultMatch[1] : undefined;
  }

  /**
   * 编译单个模型
   */
  private compileModel(name: string, model: ModelDefinition): void {
    const enums: string[] = [];
    const junctionTables: JunctionTableConfig[] = [];

    // 收集枚举
    if (model.enums) {
      for (const enumDef of model.enums) {
        enums.push(this.generateEnum(enumDef));
      }
    }

    // 收集多对多关系的关联表
    if (model.relations) {
      for (const relation of model.relations) {
        if (relation.type === 'many-to-many' && relation.junctionTable) {
          // 使用关联表名称作为唯一键（避免重复）
          const junctionKey = relation.junctionTable.name.toLowerCase();
          if (!this.allJunctionTables.has(junctionKey)) {
            this.allJunctionTables.set(junctionKey, relation.junctionTable);
            junctionTables.push(relation.junctionTable);
          }
        }
      }
    }

    // 自动为外键字段添加索引（如果还没有定义）
    if (model.relations && model.indexes) {
      const existingIndexFields = new Set<string>();
      model.indexes.forEach(idx => {
        idx.fields.forEach(field => existingIndexFields.add(field));
      });

      // 为外键字段自动添加索引
      for (const relation of model.relations) {
        if ((relation.type === 'many-to-one' || relation.type === 'one-to-one') && relation.foreignKey) {
          if (!existingIndexFields.has(relation.foreignKey)) {
            model.indexes.push({ fields: [relation.foreignKey] });
          }
        }
      }
    } else if (model.relations) {
      // 如果没有定义索引，自动为外键添加
      model.indexes = [];
      for (const relation of model.relations) {
        if ((relation.type === 'many-to-one' || relation.type === 'one-to-one') && relation.foreignKey) {
          model.indexes.push({ fields: [relation.foreignKey] });
        }
      }
    }

    // 生成模型内容
    const content = this.generateModelContent(model);

    this.compiledModels.set(name, {
      name,
      content,
      enums,
      junctionTables,
    });
  }

  /**
   * 生成枚举定义
   */
  private generateEnum(enumDef: { name: string; values: string[] }): string {
    const values = enumDef.values.map(v => `  ${v}`).join('\n');
    return `enum ${enumDef.name} {\n${values}\n}`;
  }

  /**
   * 生成模型内容
   */
  private generateModelContent(model: ModelDefinition): string {
    const lines: string[] = [];
    
    // 模型注释
    if (model.description) {
      lines.push(`// ${model.description}`);
    }
    lines.push(`model ${model.name} {`);

    // ID 字段（如果没有定义）
    const hasId = model.fields.some(f => f.name === 'id');
    if (!hasId) {
      lines.push('  id        Int      @id @default(autoincrement())');
    }

    // 收集关系中使用的外键字段名，避免重复生成
    const foreignKeyFields = new Set<string>();
    if (model.relations) {
      for (const relation of model.relations) {
        if (relation.foreignKey && (relation.type === 'many-to-one' || relation.type === 'one-to-one')) {
          foreignKeyFields.add(relation.foreignKey);
        }
      }
    }

    // 字段定义（排除 id、createdAt、updatedAt，它们会自动生成）
    // 同时排除关系中使用的外键字段（它们会在关系字段中自动生成）
    for (const field of model.fields) {
      if (field.name === 'id' || field.name === 'createdAt' || field.name === 'updatedAt') {
        continue;
      }
      // 如果是关系的外键字段，跳过（会在关系字段中自动生成）
      if (foreignKeyFields.has(field.name)) {
        continue;
      }
      const fieldLine = this.generateField(field, model.name);
      if (fieldLine) {
        lines.push(fieldLine);
      }
    }

    // 关系字段（many-to-one 和 one-to-one 会自动生成外键字段）
    if (model.relations) {
      for (const relation of model.relations) {
        // 对于 many-to-one 和 one-to-one，先生成外键字段
        if ((relation.type === 'many-to-one' || relation.type === 'one-to-one') && relation.foreignKey) {
          const foreignKeyField = model.fields.find(f => f.name === relation.foreignKey);
          if (!foreignKeyField) {
            // 如果字段定义中没有外键字段，自动生成
            // 根据关系模型名称生成注释，如 User -> 用户ID
            const comment = relation.model === 'User' ? '  // 用户ID' : '';
            if (comment) {
              lines.push(comment);
            }
            lines.push(`  ${relation.foreignKey} Int`);
          }
        }
        const relationLine = this.generateRelationField(relation, model.name);
        if (relationLine) {
          lines.push(relationLine);
        }
      }
    }

    // 添加反向关系字段
    // 1. 多对多关系的反向关系
    // 对于显式多对多关系，Prisma 要求：
    // - 两个模型都有指向关联表的字段（如 userRoles UserRole[]）
    // - 两个模型都有指向对方的关系字段（如 User.roles Role[], Role.users User[]）
    
    // 1.1 添加指向关联表的字段
    for (const [key, junctionTable] of this.allJunctionTables) {
      const models = this.findModelsForJunctionTable(junctionTable);
      if (models.length === 2) {
        // 检查当前模型是否是关联表的两个模型之一
        const isInvolved = models[0] === model.name || models[1] === model.name;
        if (isInvolved) {
          const relationName = junctionTable.name;
          const junctionFieldName = this.getJunctionTableFieldName(junctionTable, model.name);
          const junctionTableModelName = junctionTable.name;
          // 检查是否已经存在指向关联表的字段（检查 lines 数组）
          const hasJunctionField = lines.some(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith(`${junctionFieldName} `)) {
              return trimmed.includes(`${junctionTableModelName}[]`) || trimmed.includes(`${junctionTableModelName}`);
            }
            return false;
          });
          // 对于显式多对多关系，必须添加指向关联表的字段
          if (!hasJunctionField) {
            // 在 createdAt 字段之前插入，以保持字段顺序
            const createdAtIndex = lines.findIndex(line => line.trim().startsWith('createdAt'));
            if (createdAtIndex >= 0) {
              lines.splice(createdAtIndex, 0, `  ${junctionFieldName} ${junctionTableModelName}[] @relation("${relationName}")`);
            } else {
              lines.push(`  ${junctionFieldName} ${junctionTableModelName}[] @relation("${relationName}")`);
            }
          }
        }
      }
    }
    
    // 1.2 添加多对多关系的反向关系字段（如 Role.users User[]）
    // 遍历所有模型，找到定义了多对多关系指向当前模型的模型
    for (const [otherModelName, otherModel] of this.models) {
      if (otherModelName === model.name) continue;
      if (otherModel.relations) {
        for (const relation of otherModel.relations) {
          if (
            relation.type === 'many-to-many' &&
            relation.model === model.name &&
            relation.junctionTable
          ) {
            // 找到指向当前模型的多对多关系
            // 需要在当前模型中添加反向关系字段
            const relationName = relation.junctionTable.name;
            const reverseFieldName = this.pluralize(otherModelName.toLowerCase());
            // 检查是否已经存在这个关系字段
            const hasReverseField = lines.some(line => {
              const trimmed = line.trim();
              return trimmed.startsWith(`${reverseFieldName} `) && 
                     (trimmed.includes(`${otherModelName}[]`) || trimmed.includes(`${otherModelName}`));
            });
            if (!hasReverseField) {
              // 在 createdAt 字段之前插入，以保持字段顺序
              const createdAtIndex = lines.findIndex(line => line.trim().startsWith('createdAt'));
              if (createdAtIndex >= 0) {
                lines.splice(createdAtIndex, 0, `  ${reverseFieldName} ${otherModelName}[] @relation("${relationName}")`);
              } else {
                lines.push(`  ${reverseFieldName} ${otherModelName}[] @relation("${relationName}")`);
              }
            }
          }
        }
      }
    }

    // 2. 多对一关系的反向关系（一对多）
    // 遍历所有模型，找到指向当前模型的 many-to-one 关系
    for (const [otherModelName, otherModel] of this.models) {
      if (otherModelName === model.name) continue;
      if (otherModel.relations) {
        for (const relation of otherModel.relations) {
          if (relation.type === 'many-to-one' && relation.model === model.name) {
            // 找到指向当前模型的 many-to-one 关系，添加反向的一对多关系
            // 使用与 many-to-one 相同的关系名称
            const relationName = `${otherModelName}${model.name}s`;
            const fieldName = this.pluralize(otherModelName.toLowerCase());
            // 检查是否已经存在这个关系字段
            const hasField = lines.some(line => 
              line.includes(`${fieldName} ${otherModelName}[]`)
            );
            if (!hasField) {
              lines.push(`  ${fieldName} ${otherModelName}[] @relation("${relationName}")`);
            }
          }
        }
      }
    }

    // 时间戳字段（总是添加，除非明确在 fields 中定义了）
    const hasCreatedAt = model.fields.some(f => f.name === 'createdAt');
    const hasUpdatedAt = model.fields.some(f => f.name === 'updatedAt');
    if (!hasCreatedAt) {
      lines.push('  createdAt DateTime @default(now())');
    }
    if (!hasUpdatedAt) {
      lines.push('  updatedAt DateTime @updatedAt');
    }

    // 生成索引
    if (model.indexes && model.indexes.length > 0) {
      lines.push(''); // 空行分隔
      for (const index of model.indexes) {
        const indexLine = this.generateIndex(index);
        if (indexLine) {
          lines.push(indexLine);
        }
      }
    }

    // 表名映射
    const tableName = model.tableName || this.pluralize(model.name.toLowerCase());
    lines.push(`\n  @@map("${tableName}")`);
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * 生成索引定义
   */
  private generateIndex(index: { fields: string[]; unique?: boolean; name?: string }): string {
    const fieldsStr = index.fields.join(', ');
    if (index.unique) {
      return `  @@unique([${fieldsStr}]${index.name ? `, name: "${index.name}"` : ''})`;
    } else {
      return `  @@index([${fieldsStr}]${index.name ? `, name: "${index.name}"` : ''})`;
    }
  }

  /**
   * 生成字段定义
   */
  private generateField(field: any, modelName: string): string {
    const parts: string[] = [];
    
    // 字段注释
    if (field.description) {
      parts.push(`  // ${field.description}`);
    }

    // 字段名和类型
    let type = field.type;
    // 处理枚举类型（不需要加 ?，因为已经在 type 中处理）
    if (field.optional && !type.includes('?')) {
      type += '?';
    }
    parts.push(`  ${field.name} ${type}`);

    // 属性
    const attributes: string[] = [];
    if (field.unique) {
      attributes.push('@unique');
    }
    if (field.default) {
      attributes.push(`@default(${field.default})`);
    }
    if (field.dbType) {
      attributes.push(field.dbType);
    }

    // 关系属性
    if (field.relation) {
      const relAttrs = this.generateRelationAttributes(field.relation, modelName);
      attributes.push(...relAttrs);
    }

    if (attributes.length > 0) {
      parts[parts.length - 1] += ' ' + attributes.join(' ');
    }

    return parts.join('\n');
  }

  /**
   * 生成关系字段
   */
  private generateRelationField(relation: RelationDefinition, modelName: string): string {
    if (relation.type === 'many-to-many') {
      // 多对多关系：生成数组字段，使用关联表名称作为关系名称
      const relationName = relation.junctionTable?.name || `${modelName}${relation.model}`;
      return `  ${relation.field} ${relation.model}[] @relation("${relationName}")`;
    } else if (relation.type === 'one-to-many') {
      // 一对多关系：生成数组字段
      // 对于一对多关系，需要在"多"的一方（many-to-one）定义关系名称
      // 这里暂时不添加关系名称，让 many-to-one 的一方定义
      return `  ${relation.field} ${relation.model}[]`;
    } else if (relation.type === 'many-to-one') {
      // 多对一关系：生成单个字段，带关系属性
      const foreignKey = relation.foreignKey || `${relation.model.charAt(0).toLowerCase() + relation.model.slice(1)}Id`;
      const cascadeDelete = relation.cascadeDelete ? ', onDelete: Cascade' : '';
      // 生成关系名称：使用模型名称组合，如 OperationLogUsers
      // 注意：关系名称应该与反向关系字段使用的关系名称一致
      const relationName = `${modelName}${relation.model}s`;
      return `  ${relation.field} ${relation.model} @relation("${relationName}", fields: [${foreignKey}], references: [id]${cascadeDelete})`;
    } else if (relation.type === 'one-to-one') {
      // 一对一关系：生成可选字段
      return `  ${relation.field} ${relation.model}${relation.optional ? '?' : ''}`;
    }
    return '';
  }

  /**
   * 生成关系属性
   */
  private generateRelationAttributes(relation: RelationDefinition, modelName: string): string[] {
    const attrs: string[] = [];
    
    if (relation.type === 'many-to-many' && relation.junctionTable) {
      // 多对多关系通过关联表处理，这里不需要额外属性
      return attrs;
    }

    if (relation.foreignKey) {
      attrs.push(`@relation(fields: [${relation.foreignKey}], references: [id]${relation.cascadeDelete ? ', onDelete: Cascade' : ''})`);
    }

    return attrs;
  }

  /**
   * 生成关联表
   */
  private generateJunctionTables(): void {
    for (const [key, junctionTable] of this.allJunctionTables) {
      // 关联表已经收集，在合并时生成
    }
  }

  /**
   * 生成关联表模型
   */
  private generateJunctionTableModel(junctionTable: JunctionTableConfig, model1: string, model2: string): string {
    const mapName = junctionTable.mapName || this.toSnakeCase(junctionTable.name);
    const uniqueConstraint = junctionTable.unique 
      ? `\n  @@unique([${junctionTable.currentForeignKey}, ${junctionTable.relatedForeignKey}])`
      : '';
    const cascadeDelete = junctionTable.cascadeDelete ? ', onDelete: Cascade' : '';

    // 确定哪个模型对应哪个外键
    // 假设 currentForeignKey 对应 model1，relatedForeignKey 对应 model2
    const model1ForeignKey = junctionTable.currentForeignKey;
    const model2ForeignKey = junctionTable.relatedForeignKey;
    
    // 根据外键名称推断正确的模型（更准确）
    const inferredModel1 = this.inferModelNameFromForeignKey(model1ForeignKey) || model1;
    const inferredModel2 = this.inferModelNameFromForeignKey(model2ForeignKey) || model2;

    // 生成关系名称（使用关联表名称作为关系名称）
    const relationName = junctionTable.name;

    return `model ${junctionTable.name} {
  id     Int  @id @default(autoincrement())
  ${model1ForeignKey} Int
  ${model2ForeignKey} Int
  ${inferredModel1.toLowerCase()}   ${inferredModel1} @relation("${relationName}", fields: [${model1ForeignKey}], references: [id]${cascadeDelete})
  ${inferredModel2.toLowerCase()}   ${inferredModel2} @relation("${relationName}", fields: [${model2ForeignKey}], references: [id]${cascadeDelete})${uniqueConstraint}

  @@map("${mapName}")
}`;
  }

  /**
   * 合并到 schema.prisma
   */
  private mergeToSchema(): void {
    // 读取现有 schema（保留 generator 和 datasource）
    let baseContent = '';
    let existingEnums = new Map<string, string>();
    let existingModels = new Map<string, string>();

    if (fs.existsSync(this.schemaPath)) {
      const content = fs.readFileSync(this.schemaPath, 'utf-8');
      
      // 提取基础部分
      const baseMatch = content.match(/(generator[\s\S]*?datasource[\s\S]*?)(?=\n\n|enum|model|$)/m);
      if (baseMatch) {
        baseContent = baseMatch[1].trim();
      }

      // 提取现有枚举（保留手动定义的）
      const enumMatches = content.matchAll(/enum\s+(\w+)\s*\{([\s\S]*?)\}/g);
      for (const match of enumMatches) {
        existingEnums.set(match[1], match[0]);
      }

      // 提取现有模型（排除会被重新生成的）
      const modelMatches = content.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/gs);
      for (const match of modelMatches) {
        const modelName = match[1];
      // 只保留不在编译列表中的模型（如 OperationLog）
      // 检查是否是关联表
      const isJunctionTable = Array.from(this.allJunctionTables.values()).some(
        jt => jt.name === modelName
      );
      if (!this.compiledModels.has(modelName) && !isJunctionTable) {
        existingModels.set(modelName, match[0]);
      }
      }
    }

    // 如果没有基础内容，使用默认
    if (!baseContent || !baseContent.includes('provider')) {
      baseContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}`;
    } else {
      // 确保 datasource 有 provider 和正确的格式
      if (!baseContent.includes('provider = "postgresql"')) {
        // 检查 datasource 块是否完整
        if (baseContent.includes('datasource db {')) {
          baseContent = baseContent.replace(
            /datasource\s+db\s*\{[^}]*/,
            'datasource db {\n  provider = "postgresql"\n}'
          );
        } else {
          baseContent += '\n\ndatasource db {\n  provider = "postgresql"\n}';
        }
      }
      // 确保 datasource 块闭合
      if (baseContent.includes('datasource db {') && !baseContent.includes('datasource db {')) {
        baseContent = baseContent.replace(
          /datasource\s+db\s*\{([^}]*)/,
          (match, content) => {
            if (!content.trim().includes('}')) {
              return `datasource db {${content}\n}`;
            }
            return match;
          }
        );
      }
    }

    // 构建新的 schema 内容
    const parts: string[] = [baseContent, ''];

    // 添加枚举
    const allEnums = new Set<string>();
    for (const compiled of this.compiledModels.values()) {
      for (const enumDef of compiled.enums) {
        const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
        if (enumName && !allEnums.has(enumName)) {
          allEnums.add(enumName);
          if (!existingEnums.has(enumName)) {
            parts.push(enumDef);
          }
        }
      }
    }
    // 添加保留的枚举
    for (const enumDef of existingEnums.values()) {
      parts.push(enumDef);
    }

    if (allEnums.size > 0 || existingEnums.size > 0) {
      parts.push('');
    }

    // 添加关联表模型（去重）
    const junctionTableModels: string[] = [];
    const addedJunctionTables = new Set<string>();
    
    for (const [key, junctionTable] of this.allJunctionTables) {
      // 使用关联表名称去重
      if (addedJunctionTables.has(junctionTable.name)) {
        continue;
      }
      
      // 需要找到关联的两个模型
      const models = this.findModelsForJunctionTable(junctionTable);
      if (models.length === 2) {
        const junctionModel = this.generateJunctionTableModel(junctionTable, models[0], models[1]);
        junctionTableModels.push(junctionModel);
        addedJunctionTables.add(junctionTable.name);
      }
    }
    if (junctionTableModels.length > 0) {
      parts.push(...junctionTableModels);
      parts.push('');
    }

    // 添加编译的模型
    for (const compiled of this.compiledModels.values()) {
      parts.push(compiled.content);
      parts.push('');
    }

    // 添加保留的模型
    for (const model of existingModels.values()) {
      parts.push(model);
      parts.push('');
    }

    // 写入文件
    const finalContent = parts.join('\n').trim() + '\n';
    fs.writeFileSync(this.schemaPath, finalContent, 'utf-8');
    console.log(`  ✅ Schema 已写入: ${this.schemaPath}`);
  }

  /**
   * 查找关联表对应的两个模型
   */
  private findModelsForJunctionTable(junctionTable: JunctionTableConfig): string[] {
    const models: string[] = [];
    
    // 遍历所有模型，找到定义了此关联表的模型
    for (const [name, model] of this.models) {
      if (model.relations) {
        for (const relation of model.relations) {
          if (
            relation.type === 'many-to-many' &&
            relation.junctionTable?.name === junctionTable.name
          ) {
            // 找到第一个模型
            if (models.length === 0) {
              models.push(name);
              models.push(relation.model);
              return models;
            }
          }
        }
      }
    }
    
    // 如果没找到，尝试从外键名称推断
    // 例如：userId -> User, roleId -> Role
    if (models.length === 0) {
      const model1Name = this.inferModelNameFromForeignKey(junctionTable.currentForeignKey);
      const model2Name = this.inferModelNameFromForeignKey(junctionTable.relatedForeignKey);
      if (model1Name && model2Name) {
        models.push(model1Name);
        models.push(model2Name);
      }
    }
    
    return models;
  }

  /**
   * 从外键名称推断模型名称
   * 例如：userId -> User, roleId -> Role
   */
  private inferModelNameFromForeignKey(foreignKey: string): string | null {
    // 移除 'Id' 后缀，然后首字母大写
    if (foreignKey.endsWith('Id')) {
      const baseName = foreignKey.slice(0, -2);
      return baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }
    return null;
  }


  /**
   * 复数化（简单实现）
   */
  private pluralize(word: string): string {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es';
    }
    return word + 's';
  }

  /**
   * 获取关联表字段名
   * 例如：UserRole 关联表，对于 User 模型，返回 "userRoles"（指向关联表的字段）
   * RolePermission 关联表，对于 Permission 模型，返回 "rolePermissions"
   * 注意：这个字段名应该与多对多关系字段名不同，避免冲突
   */
  private getJunctionTableFieldName(junctionTable: JunctionTableConfig, modelName: string): string {
    // 从关联表名称推断字段名
    // 例如：UserRole -> userRoles, RolePermission -> rolePermissions
    const tableName = junctionTable.name;
    // 直接使用关联表名称的小写复数形式
    // 例如：RolePermission -> rolePermissions, UserRole -> userRoles
    return this.pluralize(tableName.charAt(0).toLowerCase() + tableName.slice(1));
  }

  /**
   * 转换为蛇形命名
   */
  private toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}
