import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_codes', table => {
    table
      .renameColumn('created', 'created_at')
      .comment('When the code was issued, unix timestamp');
    table
      .renameColumn('user_id', 'principal_id')
      .comment('User for which the code is issued.');
    table
      .string('scope', 1024)
      .nullable()
      .comment('OAuth2 scopes, space separated');
  });
}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration cannot be undone');

}
