import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 14});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 14,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE oauth2_codes (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  client_id INT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created INT UNSIGNED NOT NULL
)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
