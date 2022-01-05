/* eslint no-console: 0 */
import { knex, Knex } from 'knex';

let pool: Knex;

type RawMySQLResult<T> = [ T[], [] ];

interface RawPostgreSQLResult<T> {
  rows: T[],
}

type RawResult<T> = RawMySQLResult<T> | RawPostgreSQLResult<T>;

async function getPool(): Promise<Knex> {

  if (!pool) {
    pool = knex(await getSettings());
  }

  return pool;
}

export async function getConnection(): Promise<Knex> {

  return (await getPool());

}

export async function query<T = any>(query: string, params: Knex.ValueDict | Knex.RawBinding[] = []): Promise<T[]> {
  
  const { client } = await getSettings();

  // Knex returns weird typings for the raw function,
  const result = (await (await getPool()).raw(query, params)) as RawResult<T>;

  console.log(result);
  if (client === 'pg') {
    return (result as RawPostgreSQLResult<T>).rows;
  }

  return (result as RawMySQLResult<T>)[0];
}

export default {
  getConnection,
  query,
};

function getSettings(): Knex.Config {

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
    client = 'mysql2';
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
  } else {
    throw new Error('No database client selected, please provide either PG_DATABASE or MYSQL_DATABASE environment variables');
  }

  return {
    client,
    connection,
    searchPath: [
      connection.user,
      connection.database,
      'public'
    ],
    pool: { min: 0, max: 10 },
    debug: true,
  };
};
