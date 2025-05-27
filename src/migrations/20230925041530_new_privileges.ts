import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege: 'a12n:user:read-auth-factors', description: 'Read what kind of authentication credentials a user has set up.'});

}


export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', ['a12n:user:read-auth-factors']);

}

