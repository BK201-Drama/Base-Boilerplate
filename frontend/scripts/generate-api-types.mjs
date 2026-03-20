#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const schemaUrl = process.env.OPENAPI_SCHEMA_URL || 'http://localhost:3000/api/docs-json';
const output = process.env.OPENAPI_OUTPUT || './src/types/api.generated.ts';

mkdirSync(dirname(new URL(`file://${process.cwd()}/${output}`).pathname), { recursive: true });

console.log(`[openapi] schema: ${schemaUrl}`);
console.log(`[openapi] output: ${output}`);

execSync(`npx openapi-typescript "${schemaUrl}" -o "${output}" --default-non-nullable`, {
  stdio: 'inherit',
});

console.log('[openapi] done');
