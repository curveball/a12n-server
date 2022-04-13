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

  await knex.schema.createTable('user_webauthn', table => {
    table.increments();
    table.integer('user_id').unsigned().notNullable();
    table.string('credential_id', 2000).notNullable();
    table.string('public_key', 2000).notNullable();
    table.integer('counter').unsigned().notNullable();
    table.integer('created').unsigned().notNullable();
  });

  await knex.raw(`INSERT INTO server_settings (setting, value) VALUES
('registration.mfa.enabled', 'false'),
('webauthn.relyingPartyId', '""'),
('webauthn.expectedOrigin', '""'),
('webauthn.serviceName', '"Authentication API"')`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
