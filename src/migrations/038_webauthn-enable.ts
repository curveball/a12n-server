import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 38});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 38,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`INSERT INTO server_settings (setting, value) VALUES
  ('registration.mfa.enabled', 'true')
  ON DUPLICATE KEY UPDATE value = 'true'`);
  await knex.raw(`INSERT INTO server_settings (setting, value) VALUES
  ('webauthn', '"enabled"')
  ON DUPLICATE KEY UPDATE value = '"enabled"'`);
  await knex.raw(`UPDATE server_settings SET value = NULL WHERE setting 
  IN ('webauthn.relyingPartyId', 'webauthn.expectedOrigin')`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
