import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('principal_identities', table => {

    table
      .tinyint('is_mfa')
      .after('label')
      .comment('This identiy can be used for MFA checks')
      .notNullable()
      .defaultTo(0);

  });

}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.alterTable('principal_identities', table => {

    table.dropColumn('is_mfa');

  });

}

