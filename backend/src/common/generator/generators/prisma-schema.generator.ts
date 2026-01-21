/** Prisma Schema 生成器 */
import { ResourceDefinition, FieldConfig } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

const PRISMA_CONSTANTS = {
  DEFAULT_BASE_SCHEMA: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}`,
  FIELD_NAMES: {
    ID: 'id',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  PRISMA_TYPES: {
    STRING: 'String',
    INT: 'Int',
    BOOLEAN: 'Boolean',
    DATE_TIME: 'DateTime',
    JSON: 'Json',
  },
  PATHS: {
    PRISMA_DIR: 'prisma',
    MODELS_DIR: 'models',
    SCHEMA_FILE: 'schema.prisma',
  },
  FILE_EXTENSION: '.prisma',
} as const;

function isPluralField(fieldName: string): boolean {
  return fieldName.endsWith('s') || fieldName.endsWith('ies');
}

function needsTextType(fieldName: string): boolean {
  const lowerName = fieldName.toLowerCase();
  return lowerName.includes('content') || lowerName.includes('description');
}

export class PrismaSchemaGenerator {
  generateModel(resource: ResourceDefinition): string {
    const modelName = resource.prismaModel;
    const fields = this.generateFields(resource);
    const mapName = this.toSnakeCase(resource.name);
    const description = resource.description || `${modelName} 模型`;

    return `// ${description}
model ${modelName} {
${fields}

  @@map("${mapName}")
}
`;
  }

  private generateFields(resource: ResourceDefinition): string {
    const fields: string[] = [];
    fields.push(this.generateIdField());
    fields.push(...this.generateRegularFields(resource));
    fields.push(...this.generateForeignKeyFields(resource));
    fields.push(...this.generateTimestampFields(resource));
    const relationFields = this.generateRelationFields(resource);
    if (relationFields.length > 0) {
      fields.push('');
      fields.push(...relationFields);
    }
    return fields.join('\n');
  }

  private generateIdField(): string {
    return `  ${PRISMA_CONSTANTS.FIELD_NAMES.ID}        ${PRISMA_CONSTANTS.PRISMA_TYPES.INT}      @id @default(autoincrement())`;
  }

  private generateRegularFields(resource: ResourceDefinition): string[] {
    const fields: string[] = [];
    resource.fields.forEach((field) => {
      if (field.type === 'relation') {
        return;
      }
      const fieldDef = this.generateFieldDefinition(field, resource.prismaModel);
      if (fieldDef) {
        fields.push(fieldDef);
      }
    });
    return fields;
  }

  private generateForeignKeyFields(resource: ResourceDefinition): string[] {
    const fields: string[] = [];
    if (!resource.joins) {
      return fields;
    }
    resource.joins.forEach((join) => {
      const foreignKeyField = `${join.field}Id`;
      const alreadyExists = resource.fields.some((f) => f.name === foreignKeyField);
      if (alreadyExists) {
        return;
      }
      if (!isPluralField(join.field)) {
        fields.push(`  ${foreignKeyField} ${PRISMA_CONSTANTS.PRISMA_TYPES.INT}?`);
      }
    });
    return fields;
  }

  private generateTimestampFields(resource: ResourceDefinition): string[] {
    const fields: string[] = [];
    const hasCreatedAt = resource.fields.some((f) => f.name === PRISMA_CONSTANTS.FIELD_NAMES.CREATED_AT);
    const hasUpdatedAt = resource.fields.some((f) => f.name === PRISMA_CONSTANTS.FIELD_NAMES.UPDATED_AT);
    if (hasCreatedAt || hasUpdatedAt) {
      if (!hasCreatedAt) {
        fields.push(`  ${PRISMA_CONSTANTS.FIELD_NAMES.CREATED_AT} ${PRISMA_CONSTANTS.PRISMA_TYPES.DATE_TIME} @default(now())`);
      }
      if (!hasUpdatedAt) {
        fields.push(`  ${PRISMA_CONSTANTS.FIELD_NAMES.UPDATED_AT} ${PRISMA_CONSTANTS.PRISMA_TYPES.DATE_TIME} @updatedAt`);
      }
    } else {
      fields.push(`  ${PRISMA_CONSTANTS.FIELD_NAMES.CREATED_AT} ${PRISMA_CONSTANTS.PRISMA_TYPES.DATE_TIME} @default(now())`);
      fields.push(`  ${PRISMA_CONSTANTS.FIELD_NAMES.UPDATED_AT} ${PRISMA_CONSTANTS.PRISMA_TYPES.DATE_TIME} @updatedAt`);
    }
    return fields;
  }

  private generateRelationFields(resource: ResourceDefinition): string[] {
    const fields: string[] = [];

    if (!resource.joins) {
      return fields;
    }

    resource.joins.forEach((join) => {
      const relationDef = this.generateRelationDefinition(join, resource.prismaModel);
      if (relationDef) {
        fields.push(relationDef);
      }
    });

    return fields;
  }

  private generateFieldDefinition(field: FieldConfig, modelName: string): string | null {
    const prismaType = this.mapFieldTypeToPrisma(field, modelName);
    if (!prismaType) {
      return null;
    }
    const optional = field.required === false ? '?' : '';
    const unique = field.unique ? ' @unique' : '';
    const defaultValue = this.generateDefaultValue(field);
    const dbType = this.generateDbType(field);
    let fieldDef = `  ${field.name} ${prismaType}${optional}${dbType}${defaultValue}${unique}`;
    if (field.description) {
      fieldDef = `  // ${field.description}\n${fieldDef}`;
    }
    return fieldDef;
  }

  private mapFieldTypeToPrisma(field: FieldConfig, modelName: string): string | null {
    switch (field.type) {
      case 'string':
        return PRISMA_CONSTANTS.PRISMA_TYPES.STRING;
      case 'number':
        return PRISMA_CONSTANTS.PRISMA_TYPES.INT;
      case 'boolean':
        return PRISMA_CONSTANTS.PRISMA_TYPES.BOOLEAN;
      case 'date':
        return PRISMA_CONSTANTS.PRISMA_TYPES.DATE_TIME;
      case 'enum':
        return this.getEnumType(field, modelName);
      case 'json':
        return PRISMA_CONSTANTS.PRISMA_TYPES.JSON;
      case 'relation':
        return null;
      default:
        return PRISMA_CONSTANTS.PRISMA_TYPES.STRING;
    }
  }

  private getEnumType(field: FieldConfig, modelName: string): string {
    if (field.enumValues && field.enumValues.length > 0) {
      const enumName = `${modelName}${this.toPascalCase(field.name)}Enum`;
      return enumName;
    }
    return PRISMA_CONSTANTS.PRISMA_TYPES.STRING;
  }

  private generateDbType(field: FieldConfig): string {
    if (field.type === 'string' && needsTextType(field.name)) {
      return ' @db.Text';
    }
    return '';
  }

  private generateDefaultValue(field: FieldConfig): string {
    if (field.defaultValue === undefined) {
      return '';
    }
    if (field.type === 'enum') {
      return ` @default(${field.defaultValue})`;
    }
    if (typeof field.defaultValue === 'string') {
      return ` @default("${field.defaultValue}")`;
    }
    if (typeof field.defaultValue === 'number' || typeof field.defaultValue === 'boolean') {
      return ` @default(${field.defaultValue})`;
    }
    return '';
  }

  private generateRelationDefinition(
    join: NonNullable<ResourceDefinition['joins']>[0],
    currentModel: string,
  ): string | null {
    const fieldName = join.field;
    const relatedModel = join.model;
    const foreignKeyField = `${fieldName}Id`;
    if (isPluralField(fieldName)) {
      return `  ${fieldName} ${relatedModel}[]`;
    } else {
      return `  ${fieldName} ${relatedModel}? @relation(fields: [${foreignKeyField}], references: [id])`;
    }
  }

  generateEnums(resource: ResourceDefinition): string[] {
    const enumMap = new Map<string, string[]>();
    resource.fields.forEach((field) => {
      if (field.type === 'enum' && field.enumValues && field.enumValues.length > 0) {
        const enumName = `${resource.prismaModel}${this.toPascalCase(field.name)}Enum`;
        if (!enumMap.has(enumName)) {
          enumMap.set(enumName, field.enumValues);
        }
      }
    });
    const enums: string[] = [];
    enumMap.forEach((values, enumName) => {
      const enumDef = this.formatEnumDefinition(enumName, values);
      enums.push(enumDef);
    });
    return enums;
  }

  private formatEnumDefinition(enumName: string, values: string[]): string {
    return `enum ${enumName} {
  ${values.map((v) => `  ${v}`).join('\n')}
}

`;
  }

  writeToSchemaFile(
    resource: ResourceDefinition,
    schemaPath?: string,
    useSeparateFiles: boolean = true,
  ): void {
    if (useSeparateFiles) {
      this.writeToSeparateFile(resource);
      this.mergeSchemaFiles();
    } else {
      this.writeToMainSchemaFile(resource, schemaPath);
    }
  }

  private writeToSeparateFile(resource: ResourceDefinition): void {
    const modelsDir = this.getModelsDirectory();
    this.ensureDirectoryExists(modelsDir);
    const modelFileName = `${this.toKebabCase(resource.name)}${PRISMA_CONSTANTS.FILE_EXTENSION}`;
    const modelFilePath = path.join(modelsDir, modelFileName);
    if (fs.existsSync(modelFilePath)) {
      console.log(`ℹ️  模型文件已存在: ${modelFileName}，跳过生成`);
      return;
    }
    const fileContent = this.buildModelFileContent(resource);
    fs.writeFileSync(modelFilePath, fileContent, 'utf-8');
    console.log(`✅ 模型文件已生成: ${PRISMA_CONSTANTS.PATHS.PRISMA_DIR}/${PRISMA_CONSTANTS.PATHS.MODELS_DIR}/${modelFileName}`);
  }

  private buildModelFileContent(resource: ResourceDefinition): string {
    const enums = this.generateEnums(resource);
    const enumContent = enums.length > 0 ? enums.join('\n') + '\n\n' : '';
    const modelContent = this.generateModel(resource);
    return enumContent + modelContent;
  }

  private getModelsDirectory(): string {
    return path.join(process.cwd(), PRISMA_CONSTANTS.PATHS.PRISMA_DIR, PRISMA_CONSTANTS.PATHS.MODELS_DIR);
  }

  private getMainSchemaPath(): string {
    return path.join(process.cwd(), PRISMA_CONSTANTS.PATHS.PRISMA_DIR, PRISMA_CONSTANTS.PATHS.SCHEMA_FILE);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private mergeSchemaFiles(): void {
    const modelsDir = this.getModelsDirectory();
    const mainSchemaPath = this.getMainSchemaPath();
    if (!fs.existsSync(modelsDir)) {
      return;
    }
    const mainSchemaContent = this.readMainSchemaContent(mainSchemaPath);
    const baseContent = this.extractBaseContent(mainSchemaContent);
    const { existingEnums, existingModels } = this.extractExistingDefinitions(mainSchemaContent, modelsDir);
    const { newEnums, newModels, fileCount } = this.collectNewDefinitions(modelsDir, existingEnums, existingModels);
    this.writeMergedSchema(mainSchemaPath, baseContent, existingEnums, newEnums, existingModels, newModels, fileCount);
  }

  private readMainSchemaContent(schemaPath: string): string {
    if (fs.existsSync(schemaPath)) {
      return fs.readFileSync(schemaPath, 'utf-8');
    }
    return '';
  }

  private extractBaseContent(mainSchemaContent: string): string {
    const baseMatch = mainSchemaContent.match(/(generator[\s\S]*?datasource[\s\S]*?\n\})/m);
    if (baseMatch) {
      const extracted = baseMatch[1].trim();
      // 验证 datasource 是否完整（包含 provider）
      if (extracted.includes('provider') && extracted.includes('datasource')) {
        return extracted;
      }
    }
    return PRISMA_CONSTANTS.DEFAULT_BASE_SCHEMA;
  }

  private extractExistingDefinitions(
    mainSchemaContent: string,
    modelsDir: string,
  ): { existingEnums: Map<string, string>; existingModels: Map<string, string> } {
    const existingEnums = new Map<string, string>();
    const existingModels = new Map<string, string>();
    const existingEnumMatches = mainSchemaContent.match(/enum\s+(\w+)\s*\{[\s\S]*?\}/g);
    if (existingEnumMatches) {
      existingEnumMatches.forEach((enumDef) => {
        const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
        if (enumName) {
          existingEnums.set(enumName, enumDef);
        }
      });
    }
    const generatedModelNames = this.getGeneratedModelNames(modelsDir);
    const existingModelMatches = mainSchemaContent.match(/model\s+(\w+)\s*\{[\s\S]*?\n\}/g);
    if (existingModelMatches) {
      existingModelMatches.forEach((modelDef) => {
        const modelName = modelDef.match(/model\s+(\w+)/)?.[1];
        if (modelName && !generatedModelNames.includes(modelName)) {
          existingModels.set(modelName, modelDef);
        }
      });
    }
    return { existingEnums, existingModels };
  }

  private getGeneratedModelNames(modelsDir: string): string[] {
    if (!fs.existsSync(modelsDir)) {
      return [];
    }

    return fs
      .readdirSync(modelsDir)
      .filter((file) => file.endsWith(PRISMA_CONSTANTS.FILE_EXTENSION))
      .map((file) => {
        const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
        const modelMatch = content.match(/model\s+(\w+)/);
        return modelMatch ? modelMatch[1] : null;
      })
      .filter(Boolean) as string[];
  }

  private collectNewDefinitions(
    modelsDir: string,
    existingEnums: Map<string, string>,
    existingModels: Map<string, string>,
  ): { newEnums: string[]; newModels: string[]; fileCount: number } {
    const newEnums: string[] = [];
    const newModels: string[] = [];
    const prismaFiles = fs
      .readdirSync(modelsDir)
      .filter((file) => file.endsWith(PRISMA_CONSTANTS.FILE_EXTENSION))
      .sort();
    prismaFiles.forEach((file) => {
      const filePath = path.join(modelsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.extractEnumsFromContent(fileContent, existingEnums, newEnums);
      this.extractModelsFromContent(fileContent, existingModels, newModels);
    });
    return { newEnums, newModels, fileCount: prismaFiles.length };
  }

  private extractEnumsFromContent(
    fileContent: string,
    existingEnums: Map<string, string>,
    newEnums: string[],
  ): void {
    const enumMatches = fileContent.match(/enum\s+(\w+)\s*\{[\s\S]*?\}/g);
    if (enumMatches) {
      enumMatches.forEach((enumDef) => {
        const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
        if (
          enumName &&
          !existingEnums.has(enumName) &&
          !newEnums.some((e) => e.includes(`enum ${enumName}`))
        ) {
          newEnums.push(enumDef);
        }
      });
    }
  }

  private extractModelsFromContent(
    fileContent: string,
    existingModels: Map<string, string>,
    newModels: string[],
  ): void {
    const modelMatches = fileContent.match(/model\s+(\w+)\s*\{[\s\S]*?\n\}/g);
    if (modelMatches) {
      modelMatches.forEach((modelDef) => {
        const modelName = modelDef.match(/model\s+(\w+)/)?.[1];
        if (
          modelName &&
          !existingModels.has(modelName) &&
          !newModels.some((m) => m.includes(`model ${modelName}`))
        ) {
          newModels.push(modelDef);
        }
      });
    }
  }

  private writeMergedSchema(
    mainSchemaPath: string,
    baseContent: string,
    existingEnums: Map<string, string>,
    newEnums: string[],
    existingModels: Map<string, string>,
    newModels: string[],
    fileCount: number,
  ): void {
    const allEnums = [...existingEnums.values(), ...newEnums];
    const allModels = [...existingModels.values(), ...newModels];
    const mergedContent = [baseContent, '', ...allEnums, '', ...allModels]
      .filter(Boolean)
      .join('\n\n');
    fs.writeFileSync(mainSchemaPath, mergedContent, 'utf-8');
    console.log(
      `✅ 已合并 ${fileCount} 个模型文件到 schema.prisma（保留 ${existingModels.size} 个已有模型）`,
    );
  }

  private writeToMainSchemaFile(
    resource: ResourceDefinition,
    schemaPath: string = this.getMainSchemaPath(),
  ): void {
    const existingContent = this.readMainSchemaContent(schemaPath);
    const modelRegex = new RegExp(`model\\s+${resource.prismaModel}\\s*\\{`, 'g');
    if (modelRegex.test(existingContent)) {
      console.log(`ℹ️  模型 ${resource.prismaModel} 已在 Schema 中存在，跳过生成`);
      return;
    }
    const enums = this.generateEnums(resource);
    const modelContent = this.generateModel(resource);
    let newContent = this.insertEnumsIntoContent(existingContent, enums);
    newContent = newContent.trim() + '\n\n' + modelContent;
    fs.writeFileSync(schemaPath, newContent, 'utf-8');
    console.log(`✅ Prisma Schema 已更新: ${resource.prismaModel}`);
  }

  private insertEnumsIntoContent(existingContent: string, enums: string[]): string {
    let newContent = existingContent;
    enums.forEach((enumDef) => {
      const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
      if (enumName && !existingContent.includes(`enum ${enumName}`)) {
        const insertPoint = existingContent.lastIndexOf('datasource');
        if (insertPoint > 0) {
          const afterDatasource = existingContent.indexOf('\n\n', insertPoint);
          if (afterDatasource > 0) {
            newContent =
              existingContent.slice(0, afterDatasource + 2) +
              enumDef +
              existingContent.slice(afterDatasource + 2);
            existingContent = newContent;
          }
        }
      }
    });
    return newContent;
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/_+/g, '_');
  }
}
