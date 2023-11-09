import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  if (knex().client.driverName === 'sqlite3') {
    // Changing the mode of the sqlite3 database to WAL
    // is basically required to get concurrency.
    await knex.raw('PRAGMA journal_mode=WAL');
  }

}


export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration cannot be reverted yet');

}
