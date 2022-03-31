import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 12});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 12,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`RENAME TABLE users_auth_log TO user_log`);
  await knex.raw(`ALTER TABLE user_log ADD
  ip VARCHAR(45) NOT NULL`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
