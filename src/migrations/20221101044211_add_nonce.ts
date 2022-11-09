import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('oauth2_codes', table => {
    table
      .string('nonce', 100).nullable().comment('OpenID Connect Nonce');
  });
}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.alterTable('oauth2_codes', table => {
    table.dropColumn('nonce');
  });
}
