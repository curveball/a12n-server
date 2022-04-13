import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 26});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 26,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('reset_password_token', table => {

    table.increments();
    table.integer('user_id').unsigned().notNullable();
    table.string('token', 100).notNullable().unique();
    table.integer('expires_at').unsigned().notNullable();
    table.integer('created_at').unsigned().notNullable();

  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
