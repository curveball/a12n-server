import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 23});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 23,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE server_settings (
  setting VARCHAR(200) NOT NULL PRIMARY KEY,
  value VARCHAR(2000)
)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
