import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 3});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 3,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE oauth2_token (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(50) NOT NULL,
  access_token VARCHAR(50) NOT NULL UNIQUE,
  refresh_token VARCHAR(50) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  access_token_expires INT UNSIGNED NOT NULL,
  refresh_token_expires INT UNSIGNED NOT NULL,
  created INT UNSIGNED NOT NULL
)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
