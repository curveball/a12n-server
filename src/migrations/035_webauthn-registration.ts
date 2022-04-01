import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 35});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 35,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE user_webauthn (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  credential_id VARCHAR(2000) NOT NULL,
  public_key VARCHAR(2000) NOT NULL,
  counter INT UNSIGNED NOT NULL,
  created INT UNSIGNED NOT NULL
)`);
  await knex.raw(`INSERT INTO server_settings (setting, value) VALUES
('registration.mfa.enabled', 'false'),
('webauthn.relyingPartyId', '""'),
('webauthn.expectedOrigin', '""'),
('webauthn.serviceName', '"Authentication API"')`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
