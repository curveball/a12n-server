import mysql from 'mysql2/promise';

let pool: any = null;

async function getPool() {

  if (!pool) {
    pool = mysql.createPool(await getSettings());
  }

  return pool;

}

export default {

  async getConnection() {

    return (await getPool()).getConnection();

  },

  async query(query: string, ...args: any[]) {

    return (await getPool()).query(query, ...args);

  }

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
