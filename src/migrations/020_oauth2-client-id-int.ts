import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 20});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 20,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.alterTable('oauth2_tokens', table => {
    table.integer('oauth2_client_id').unsigned().notNullable().alter();
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
