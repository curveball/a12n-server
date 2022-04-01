import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 42});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 42,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.renameTable('users', 'principals');
  await knex.schema.alterTable('principals', table => {
    table.renameColumn('created', 'created_at');
  });
  await knex.schema.alterTable('principals', table => {
    table.bigInteger('created_at').notNullable().alter();
    table.bigInteger('modified_at').notNullable();
  });
  await knex.raw('UPDATE principals SET created_at = created_at * 1000, modified_at = ?', [Date.now()]);

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
