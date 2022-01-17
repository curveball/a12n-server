import { Knex } from 'knex';

// Funny how this number ended up being the last changelog migration...
const MAGIC_CHANGELOG_NUMBER = 42;

export async function up(knex: Knex): Promise<void> {
  // If table changelog is unavailable,
  //  or if the last changelog migration row is less than < 42.

  if (!await knex.schema.hasTable('changelog')) {
    throw new Error('Old Migrations have never run, please apply those manually and then run `make migrate`.');
  }

  const result = await knex('changelog').select('id').orderBy('id', 'desc').limit(1);

  if (result[0].id < MAGIC_CHANGELOG_NUMBER) {
    throw new Error('Migrations must have reached `changelog` version 42 before applying Knex migrations, please apply those manually and then run `make migrate`.');
  }

}


export async function down(knex: Knex): Promise<void> {
  // This is the first migration of the new system, there are only the
  //  old patches from before.
}

