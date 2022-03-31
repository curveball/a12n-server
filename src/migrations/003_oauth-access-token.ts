import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 3});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 3,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('oauth2_token', table => {

    table.increments();
    table.string('client_id', 50).notNullable();
    table.string('access_token', 50).notNullable().unique();
    table.string('refresh_token', 50).notNullable().unique();
    table.integer('user_id').unsigned().notNullable();
    table.integer('access_token_expires').unsigned().notNullable();
    table.integer('refresh_token_expires').unsigned().notNullable();
    table.integer('created').unsigned().notNullable();

  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
