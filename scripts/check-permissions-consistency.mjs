#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

function extractStrings(source, regex) {
  const set = new Set();
  let m;
  while ((m = regex.exec(source)) !== null) {
    set.add(m[1]);
  }
  return set;
}

const backendPath = resolve(root, 'backend/src/common/permissions.ts');
const frontendPath = resolve(root, 'frontend/src/constants/permissions.ts');

const backendContent = readFileSync(backendPath, 'utf-8');
const frontendContent = readFileSync(frontendPath, 'utf-8');

const backend = extractStrings(backendContent, /'([a-z_]+:[a-z_]+)'/g);
const frontend = extractStrings(frontendContent, /resource:\s*'([a-z_]+)'\s*,\s*action:\s*'([a-z_]+)'/g);

const frontendNormalized = new Set();
for (const m of frontendContent.matchAll(/resource:\s*'([a-z_]+)'\s*,\s*action:\s*'([a-z_]+)'/g)) {
  frontendNormalized.add(`${m[1]}:${m[2]}`);
}

const onlyBackend = [...backend].filter((p) => !frontendNormalized.has(p));
const onlyFrontend = [...frontendNormalized].filter((p) => !backend.has(p));

if (onlyBackend.length || onlyFrontend.length) {
  console.error('❌ Permission constants mismatch detected.');
  if (onlyBackend.length) console.error('Only in backend:', onlyBackend.join(', '));
  if (onlyFrontend.length) console.error('Only in frontend:', onlyFrontend.join(', '));
  process.exit(1);
}

console.log('✅ Permission constants are consistent between backend and frontend.');
