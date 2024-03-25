/* eslint no-console: 0 */
import { knex, Knex } from 'knex';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import './db-types';

dotenv.config();

let settings: Knex.Config | null = null;
const db: Knex = knex(getSettings());

export async function init() {

  console.info('Running database migrations');
  await db.migrate.latest();

}

export default db;

type RawMySQLResult<T> = [ T[], [] ];
type RawPostgreSQLResult<T> = {
  rows: T[];
}

type RawSqlite3Result<T> = T[];

type RawResult<T> = RawMySQLResult<T> | RawPostgreSQLResult<T> | RawSqlite3Result<T>;



/**
 * A shortcut for easily executing select queries.
 *
 * Use of this should be phased out, but it helped with the migration from
 * before knex.
 */
export async function query<T = any>(query: string, params: Knex.ValueDict | Knex.RawBinding[] = []): Promise<T[]> {

  // Knex returns weird typings for the raw function,
  const result = (await db.raw(query, params)) as RawResult<T>;

  switch (settings?.client) {
    case 'pg':
      return (result as RawPostgreSQLResult<T>).rows;
    case 'sqlite3':
      return (result as RawSqlite3Result<T>);
    case 'mysql2':
      return (result as RawMySQLResult<T>)[0];
    default:
      throw new Error(`Unknown driver: ${settings?.client}`);
  }

}

/**
 * Inserts a single record and return id
 *
 * Sadly we need a helper function.
 */
export async function insertAndGetId<T extends Record<string, any>> (
  tableName: string,
  data: T
): Promise<number> {

  const result = await db(tableName).insert(data, 'id');
  return result[0]?.id ?? result[0];

}


export function getSettings(): Knex.Config {

  let connection: Knex.MySql2ConnectionConfig | Knex.PgConnectionConfig | Knex.Sqlite3ConnectionConfig;
  let client;
  let searchPath;
  let useNullAsDefault: undefined|true = undefined;
  const pool: Knex.PoolConfig = {
    min: 0,
    max: 10
  };

  if (process.env.PG_DATABASE) {

    console.warn('The PG_* environment variables are deprecated. Use DB_DRIVER=pg, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE instead');

    client = 'pg';
    connection = {
      host: process.env.PG_HOST || '127.0.0.1',
      port: parseInt(process.env.PG_PORT as string, 10) || 5432,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    };
    searchPath = [
      connection.user as string,
      connection.database as string,
      'public',
    ];


  } else if (process.env.MYSQL_DATABASE) {

    console.warn('The MYSQL_* environment variables are deprecated. Use DB_DRIVER=mysql, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE instead');

    client = 'mysql2';
    connection = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT as string, 10) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    };

    if (process.env.MYSQL_INSTANCE_CONNECTION_NAME) {
      (connection as Knex.MySql2ConnectionConfig).socketPath = '/cloudsql/' + process.env.MYSQL_INSTANCE_CONNECTION_NAME;
      delete connection.host;
      delete connection.port;
    }

  } else {

    switch(process.env.DB_DRIVER) {

      case 'pg':
        client = 'pg';
        connection = {
          host: process.env.DB_HOST || '127.0.0.1',
          port: parseInt(process.env.DB_PORT as string, 10) || 5432,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        };
        searchPath = [
          connection.user as string,
          connection.database as string,
        ];
        break;
      case 'mysql' :
      case 'mysql2' :
        client = 'mysql2';
        connection = {
          host: process.env.DB_HOST || '127.0.0.1',
          port: parseInt(process.env.DB_PORT as string, 10) || 3306,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        };

        if (process.env.MYSQL_INSTANCE_CONNECTION_NAME) {
          (connection as Knex.MySql2ConnectionConfig).socketPath = '/cloudsql/' + process.env.MYSQL_INSTANCE_CONNECTION_NAME;
        } else {
          delete connection.host;
          delete connection.port;
        }
        break;

      case 'sqlite' :
      case 'sqlite3' :
      case undefined :
        client = 'sqlite3';

        if (process.env.DB_DRIVER === undefined) {
          console.warn('No database settings were found, so we\'re creating a sqlite database in the current directory. This is not recommended for production');
        }

        connection = {
          filename: process.env.DB_FILENAME || 'a12nserver.sqlite3',
        };
        useNullAsDefault = true;
        break;

      default:
        throw new Error(`Unknown value for DB_DRIVER: ${process.env.DB_DRIVER}`);


    }

  }

  settings = {
    client,
    connection,
    searchPath,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      loadExtensions: ['.js'],
    },
    pool,
    debug: process.env.DEBUG ? true : false,
    useNullAsDefault: useNullAsDefault,
  };

  return settings;
}
