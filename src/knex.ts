/* eslint no-console: 0 */
import { knex, Knex } from 'knex';

let pool: Knex;

async function getPool(): Promise<Knex> {

  if (!pool) {
    pool = knex(await getSettings());
  }

  return pool;
}

export async function getConnection(): Promise<Knex> {

  return (await getPool());

}

export async function query(query: string, params: Knex.Value | Knex.ValueDict): Promise<Knex<any, any>> {

  return (await getPool()).raw(query, params);

}

export default {
  getConnection,
  query,
};

async function getSettings() {

  let connection: any = {};
  let client: string = '';

  // Declare explicitly the client to use, or try to infer it.
  if (Object.keys(process.env).includes('PG_DATABASE')) {
    client = 'pg';
    connection = {
      host: process.env.PG_HOST || '127.0.0.1',
      port: process.env.PG_PORT || 5432,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    };
  } else if (Object.keys(process.env).includes('MYSQL_DATABASE')) {
    client = 'mysql';
    connection = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    }

    if (process.env.MYSQL_INSTANCE_CONNECTION_NAME) {
      connection.socketPath = '/cloudsql/' + process.env.MYSQL_INSTANCE_CONNECTION_NAME;
    } else {
      delete connection.host;
      delete connection.port;
    }
  }

  // We are running in a local environment.
  return {
    client,
    connection,
    searchPath: [
      connection.user,
      connection.database,
      'public'
    ],
    pool: { min: 0, max: 10 },
  };
};
