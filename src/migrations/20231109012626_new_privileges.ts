import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege: 'a12n:one-time-token:generate', description: 'Create a token for an arbitrary user, this token grants full access to this account.'});

  await knex('privileges')
    .insert({privilege: 'a12n:one-time-token:exchange', description: 'Exchange a one-time-token for a OAuth2 access token.'});
}


export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', ['a12n:one-time-token:generate', 'a12n:one-time-token:exchange']);

}

