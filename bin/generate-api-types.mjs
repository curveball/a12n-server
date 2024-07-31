#!/usr/bin/env node
import * as fs from 'fs';
import { compileFromFile } from 'json-schema-to-typescript'

console.log('Generating API types from JSON schemas');
const files = [];
for(const file of fs.readdirSync('./schemas')) {
  if (file.match(/\.json$/)) {
    files.push(file);
  }
}

let out = '';

for(const file of files) {
  console.log(' - ' + file);
  // compile from file
  out+=await compileFromFile(
    'schemas/' + file,
    {
      ignoreMinAndMaxItems: true,
      unknownAny: true,
      additionalProperties: false,
      $refOptions: {
        resolve: {
          http: {
            canRead: /curveball.js.org\/schemas\/.*$/,
            read: async (file) => {
              // Schema url uses singular "schema", but our directory is "schema".
              // Therefore we need to replace them to read the correct file path!
              const baseNameMatch = file.url.match(/schema\/(.*)/);
              return fs.readFileSync(`schemas/${baseNameMatch[1]}`);
            }
         },
        }
      },
    }
  );

}

fs.writeFileSync('src/api-types.ts', out)

