import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 32});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 32,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE privileges (
  privilege VARCHAR(200) NOT NULL PRIMARY KEY,
  description VARCHAR(2000) NOT NULL
)`);
  await knex.raw(`INSERT INTO privileges (privilege, description) VALUES ('admin', 'Full admin privileges on the authenciation server')`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
