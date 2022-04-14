import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 12});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 12,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.renameTable('users_auth_log', 'user_log');
  await knex.schema.alterTable('user_log', table => {
    table.string('ip', 45).notNullable();
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
