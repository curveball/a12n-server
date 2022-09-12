import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_tokens', table => {
    table
      .renameColumn('created', 'created_at');
    table
      .tinyint('grant_type')
      .unsigned()
      .nullable()
      .comment('1=implicit, 2=client_credentials, 3=password, 4=authorization_code, 5=authorization_code with secret,6=one-time-token');
    table
      .string('scope', 1024)
      .nullable()
      .comment('OAuth2 scopes, space separated');
  });
}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration cannot be undone');

}
