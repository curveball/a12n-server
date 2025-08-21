import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  // Empty because something went wrong writing this migration
  // We need to keep it around because knex will complain when
  // already-applied migrations are missing.
}

export async function down(knex: Knex): Promise<void> {

}
