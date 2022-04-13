import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('user_passwords', table => {

    table.string('password', 60).notNullable().alter();

  });

}


export async function down(knex: Knex): Promise<void> {
  throw new Error('No down script for this migration');
}
