import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 31});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 31,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`INSERT INTO server_settings (setting, value) VALUES
('oauth2.accessToken.expiry', 600),
('oauth2.refreshToken.expiry', 21600),
('oauth2.code.expiry', 600)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
