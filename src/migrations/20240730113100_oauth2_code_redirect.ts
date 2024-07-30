import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('oauth2_codes', table => {

    table
      .string('redirect_uri', 300)
      .after('scope')
      .comment('The redirect_uri that was used when generating this code');

    table
      .tinyint('grant_type')
      .after('scope')
      .comment('The grant_type that was used to generate the code');

  });

  await knex('oauth2_codes').update({grant_type: 4});

  await knex.schema.alterTable('oauth2_codes', table => {

    table
      .tinyint('grant_type')
      .after('scope')
      .notNullable()
      .comment('The grant_type that was used to generate the code')
      .alter();

  });

}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.alterTable('oauth2_codes', table => {

    table
      .dropColumn('redirect_uri');

    table
      .dropColumn('grant_type');

  });

}
