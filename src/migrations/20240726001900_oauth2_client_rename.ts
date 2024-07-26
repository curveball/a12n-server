import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('oauth2_redirect_uris', table => {

    table.renameColumn('oauth2_client_id', 'app_client_id');

  });
  await knex.schema.alterTable('oauth2_tokens', table => {

    table.renameColumn('oauth2_client_id', 'app_client_id');

  });


}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.alterTable('oauth2_redirect_uris', table => {

    table.renameColumn('app_client_id', 'oauth2_client_id');

  });
  await knex.schema.alterTable('oauth2_tokens', table => {

    table.renameColumn('app_client_id', 'oauth2_client_id');

  });

}
