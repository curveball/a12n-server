import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.renameTable('oauth2_clients', 'app_client');

  await knex.schema.alterTable('app_clients', table => {

    table
      .string('allowed_grant_types', 200)
      .notNullable()
      .comment('List of OAuth2 grant_types / flows this client is allowed to use')
      .alter();

  });


}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.renameTable('app_clients', 'oauth2_clients');

}
