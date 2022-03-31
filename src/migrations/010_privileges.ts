import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 10});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 10,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE user_privileges (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  privilege VARCHAR(50) NOT NULL
)`);
  await knex.raw(`INSERT INTO user_privileges (user_id, privilege) SELECT user_id, permission from user_permissions`);
  await knex.raw(`DROP TABLE user_permissions`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
