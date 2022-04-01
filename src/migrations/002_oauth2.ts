import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 2});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 2,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('oauth2_clients', table => {

    table.increments('id');
    table.string('client_id', 50).notNullable().unique();
    table.string('client_secret', 50).notNullable();
    table.string('allowed_grant_types', 50).notNullable();
    table.string('name', 50).notNullable();

  });
  await knex.schema.createTable('oauth2_redirection_urls', table => {

    table.increments('id');
    table.integer('oauth2_client_id').unique().notNullable();
    table.string('url', 300).notNullable();

  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
