#!/usr/bin/env node
/* eslint-disable */

import * as fs from 'fs';
import { generateMysqlTypes } from 'mysql-types-generator';
import * as url from 'url';
import mysql2 from 'mysql2/promise';

console.log('Generating types');

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const outPath = __dirname + '../src/db-types.ts';
const tempOutPath = outPath + '.tmp';

const connectionInfo = {
  host: 'localhost',
  port: 3306,
  user: 'a12nserver',
  password: 'password',
  database: 'a12nserver'
};

fs.writeFileSync(tempOutPath, '');
await generateMysqlTypes({
  db: connectionInfo,
  output: {
    file: tempOutPath,
  },
  suffix: 'Record',
  ignoreTables: [],
  overrides: [{
    tableName: 'oauth2_codes',
    columnName: 'code_challenge_method',
    columnType: 'enum',
    enumString: "enum('plain','S256')"
  }],
});

const tableDefinitions = fs.readFileSync(tempOutPath);
fs.unlinkSync(tempOutPath);

const tableMap = await generateTableMap();

const newOutput =
`
declare module 'knex/types/tables' {

${tableMap}

${tableDefinitions}

}
`;


fs.writeFileSync(outPath, newOutput);

async function generateTableMap() {

  const connection = await mysql2.createConnection(connectionInfo);
  const tables = await connection.query('SHOW TABLES');

  const tableNames = tables[0]
    .map( tableRow => Object.values(tableRow)[0] )
    .filter( tableName => !tableName.startsWith('knex_'));
  await connection.close();

  return (
`interface Tables {
${tableNames.map(tableName => `  ${tableName}: ${getTypeName(tableName)};`).join('\n')}
}
`);

}

function getTypeName(tableName) {
  return tableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Record';

}
