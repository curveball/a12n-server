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

  await knex.schema.createTable('oauth2_codes', table => {

    table.increments();
    table.integer('client_id').unsigned().notNullable();
    table.string('code', 50).notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.integer('created').unsigned().notNullable();

  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
