import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege: 'a12n:user:change-password', description: 'Allow changing a users\' password.'});

}


export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', ['a12n:user:change-password']);

}

