import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  readFileSync(dirname(fileURLToPath(import.meta.url)) + '/../package.json', 'utf-8')
);

export const VERSION = pkg.version;
export const NAME = pkg.name;
