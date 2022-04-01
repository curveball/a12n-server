import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 5});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 5,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('oauth2_redirect_uris', table => {

    table.increments();
    table.integer('oauth2_client_id').notNullable().unsigned();
    table.string('uri', 300).notNullable();

  });

  await knex.raw('INSERT INTO oauth2_redirect_uris (oauth2_client_id, uri) SELECT oauth2_client_id, url FROM oauth2_redirection_urls');
  await knex.schema.dropTable('oauth2_redirection_urls');

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
