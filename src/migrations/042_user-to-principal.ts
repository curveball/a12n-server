import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 42});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 42,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw('RENAME TABLE users to principals');
  await knex.raw(`ALTER TABLE principals 
  CHANGE created created_at BIGINT NOT NULL,
  ADD modified_at BIGINT NOT NULL`);
  await knex.raw('UPDATE principals SET created_at = created_at * 1000, modified_at = UNIX_TIMESTAMP()*1000');


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
