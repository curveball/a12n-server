import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 27});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 27,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`ALTER TABLE user_log ADD
  user_agent TEXT NULL`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
