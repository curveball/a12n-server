import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 26});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 26,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE reset_password_token (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(100) NOT NULL UNIQUE,
  expires_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL
)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
