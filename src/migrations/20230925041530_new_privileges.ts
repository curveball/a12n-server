import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege: 'a12n:principals:list', description: 'Read user, app and group information'});

  await knex('privileges')
    .insert({privilege: 'a12n:principals:create', description: 'Create new users, apps and groups'});

  await knex('privileges')
    .insert({privilege: 'a12n:principals:update', description: 'Update users, apps and groups'});

}


export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', ['a12n:principals:list', 'a12n:principal:create', 'a12n:principal:update']);

}

