import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 17});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 17,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`-- This patch breaks some MySQL servers. A new version has
-- created as patch 21

-- ALTER TABLE oauth2_tokens
--   CHANGE access_token access_token VARCHAR(2000) NOT NULL UNIQUE`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
