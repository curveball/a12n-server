import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 28});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 28,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('group_members', table => {
    table.integer('user_id').unsigned().notNullable();
    table.integer('group_id').unsigned().notNullable();
  });

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
