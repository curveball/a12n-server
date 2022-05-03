import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_clients', table => {

    table.boolean('require_pkce');

  });
  await knex('oauth2_client')
    .update({require_pkce: 0});
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_clients', table => {

    table.dropColumn('require_pkce');

  });

}
