import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('principals', table => {
    table
      .string('external_id')
      .nullable()
      .after('identity')
      .unique();
  });

  await knex.raw('UPDATE principals SET external_id = id WHERE external_id IS NULL');

  await knex.schema.alterTable('principals', table => {
    table
      .string('external_id')
      .notNullable()
      .alter();
  });

}


export async function down(knex: Knex): Promise<void> {

  await knex.schema.createTable('principals', table => {
    table
      .dropColumn('external_id');
  });

}

