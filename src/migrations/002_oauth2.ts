import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 2});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 2,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE oauth2_clients (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(50) NOT NULL UNIQUE,
  client_secret VARCHAR(50) NOT NULL,
  allowed_grant_types VARCHAR(50) NOT NULL,
  name VARCHAR(50)
)`);
  await knex.raw(`CREATE TABLE oauth2_redirection_urls (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  oauth2_client_id INT UNSIGNED NOT NULL,
  url VARCHAR(300) NOT NULL
)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
