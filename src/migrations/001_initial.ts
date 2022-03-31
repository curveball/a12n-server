import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  if (await knex.schema.hasTable('changelog')) {
    // This migration has been applied
    return;
  }

  await knex.schema.createTable('changelog', table => {

    table.integer('id').unsigned().primary();
    table.integer('timestamp').unsigned();

  });

  await knex('changelog').insert({
    id: 1,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('identity').notNullable().unique();
    table.string('nickname');
    table.integer('created').unsigned().notNullable();
    table.boolean('active').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('users_auth_log', table => {

    table.increments('id');
    table.integer('time').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.tinyint('event_type').unsigned().notNullable();

  });

  await knex.schema.createTable('user_passwords', table => {

    table.integer('user_id').unsigned().notNullable().primary();
    table.string('password').notNullable();

  });

  await knex.schema.createTable('user_totp', table => {

    table.integer('user_totp').unsigned().notNullable().primary();
    table.string('secret', 50);
    table.tinyint('failures').unsigned().notNullable().defaultTo(0);

  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
