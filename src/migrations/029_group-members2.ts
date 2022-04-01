import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 29});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 29,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`ALTER TABLE group_members
  CHANGE user_id user_id INT UNSIGNED NOT NULL,
  CHANGE group_id group_id INT UNSIGNED NOT NULL,
  ADD PRIMARY KEY (user_id, group_id)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
