import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 25});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 25,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.alterTable('user_privileges', table => {
    table.renameColumn('privilege', 'scope');
    table.string('resource', 255).notNullable().defaultTo('*').after('user_id');
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
