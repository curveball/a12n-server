import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 8});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 8,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`ALTER TABLE oauth2_clients
  CHANGE client_secret client_secret VARCHAR(60) NOT NULL`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
