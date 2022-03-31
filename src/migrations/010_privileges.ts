import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 10});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 10,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.schema.createTable('user_privileges', table => {

    table.increments();
    table.integer('user_id').unsigned().notNullable();
    table.string('privilege', 50).notNullable();

  });

  await knex.raw('INSERT INTO user_privileges (user_id, privilege) SELECT user_id, permission from user_permissions');
  await knex.schema.dropTable('user_permissions');


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
