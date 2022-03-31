import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 7});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 7,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.alterTable('oauth2_clients', table => {
    table.integer('user_id').unsigned().notNullable();
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
