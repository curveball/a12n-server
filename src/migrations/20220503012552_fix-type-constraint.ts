import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_clients', table => {
    table
      .boolean('require_pkce');
  });
  await knex('oauth2_clients')
    .update({require_pkce: 0});

  await knex.schema.alterTable('oauth2_clients', table => {
    table
      .boolean('require_pkce')
      .notNullable()
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_clients', table => {

    table.dropColumn('require_pkce');

  });

}
