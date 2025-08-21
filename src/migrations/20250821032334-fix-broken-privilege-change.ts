import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  // Something went really wrong in this PR
  // https://github.com/curveball/a12n-server/pull/669
  // This repairs all the damage.

  await knex('privileges')
    .insert([
      { 'privilege': 'a12n:principals:list', description: 'Read user, app and group information' },
      { 'privilege': 'a12n:principals:create', description: 'Create new users, apps and groups' },
      { 'privilege': 'a12n:principals:update', description: 'Update existing users, apps and groups' },
      { 'privilege': 'a12n:user:read-auth-factors', description: 'Read what kind of authentication credentials a user has set up.' }
    ]).onConflict().ignore();

  await knex('privileges').delete().where('privilege', 'a12n:user:manage-auth-factors');

  await knex('user_privileges')
    .update('privilege', 'a12n:user:read-auth-factors')
    .where('privilege', 'a12n:user:manage-auth-factors');

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration does not have a "down" script');

}
