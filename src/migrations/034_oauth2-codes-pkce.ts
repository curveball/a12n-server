import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 34});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 34,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.alterTable('oauth2_codes', table => {

    table.string('code_challenge', 50).nullable().after('user_id');
    table.string('code_challenge_method', 50).nullable().after('user_id');

  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
