import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('user_passwords', table => {
    table
      .string('force_reset')
      .nullable();
  });

  await knex.raw('UPDATE user_passwords SET force_reset = false WHERE force_reset IS NULL');

  await knex.schema.alterTable('user_passwords', table => {
    table
      .string('force_reset')
      .notNullable()
      .alter();
  });
}


export async function down(knex: Knex): Promise<void> {

  await knex.schema.createTable('user_passwords', table => {
    table
      .dropColumn('force_reset');
  });

}

