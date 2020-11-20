/* eslint no-console: 0 */
import mysql from 'mysql2/promise';
import { readdir } from 'fs/promises';
import { join } from 'path';

let pool: any = null;

async function getPool() {

  if (!pool) {
    pool = mysql.createPool(await getSettings());
  }

  return pool;

}


export async function getConnection() {

  return (await getPool()).getConnection();

}

export async function query(query: string, ...args: any[]) {

  return (await getPool()).query(query, ...args);

}

export async function checkPatches() {

  // Get a list of known database patches.
  const files = await readdir(join(__dirname, '..', 'mysql-schema'));
  const patches = new Map<number, string>();
  for(const file of files) {
    const match = file.match(/^([0-9]+)-.*\.sql$/);
    if (!match) continue;
    patches.set(
      parseInt(match[1]),
      file
    );
  }

  const result = await query('SELECT id FROM changelog');
  for (const { id } of result[0]) {
    if (!patches.has(id)) {
      console.warn('Warning! Found an unknown database patch in the changelog. Patch id: ' + id);
    }
    patches.delete(id);
  }

  if (patches.size > 0) {
    console.error('Error!! Database patches have not been applied. Please run the following .sql scripts:');
    for (const fileName of patches.values()) {
      console.error(`  - ${fileName}`);
    }
    throw new Error('Missing patches');
  }

}

export default {
  query,
  getConnection,
  checkPatches,
};

async function getSettings() {

  let settings: any = {};

  // We are running in a local environment.
  settings = {
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };

  if (process.env.MYSQL_INSTANCE_CONNECTION_NAME) {
    settings.socketPath = '/cloudsql/' + process.env.MYSQL_INSTANCE_CONNECTION_NAME;
  } else {
    settings.host = process.env.MYSQL_HOST;
  }
  return settings;

}
