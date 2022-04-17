import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 11});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 11,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.alterTable('oauth2_clients', table => {
    table.dropColumn('name');
  });
  await knex.schema.alterTable('users', table => {
    table
      .tinyint('type')
      .unsigned()
      .notNullable()
      .comment('1 = user, 2 = app, 3 = group');
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
