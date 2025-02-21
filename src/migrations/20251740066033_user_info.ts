import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable('user_info', table => {
    table.integer('principal_id').notNullable().primary().references('principals.id');
    table.string('name', 200).nullable().comment('End-User\'s full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User\'s locale and preferences.');
    table.string('middle_name').nullable().comment('Middle name(s) of the End-User.');
    table.string('given_name', 30).nullable().comment('Given name(s) or first name(s) of the End-User.');
    table.string('family_name', 30).nullable().comment('Surname(s) or last name(s) of the End-User.');
    table.date('birthdate').nullable().comment('End-User\'s birthday');
    table.text('address').nullable().comment('End-User\'s preferred postal address. ');
    table.string('locale', 5).nullable().comment('End-User\'s locale. For example, en-US or fr-CA.');
    table.string('zoneinfo').nullable().comment('End-User\'s time zone. For example, Europe/Paris or America/Los_Angeles.');
    table.integer('created_at').unsigned().comment('Time the user_info record was created.');
    table.integer('updated_at').unsigned().nullable().comment('Time the End-User\'s information was last updated.');
    table.text('metadata');
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
