#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const standalone = join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('Standalone output not found. Run "next build" first.');
  process.exit(1);
}

const copies = [
  { from: join(root, '.next', 'static'), to: join(standalone, '.next', 'static') },
  { from: join(root, 'public'), to: join(standalone, 'public') },
];

for (const { from, to } of copies) {
  if (!existsSync(from)) {
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`copied ${relative(root, from)} -> ${relative(root, to)}`);
}

console.log('Standalone output is ready.');
