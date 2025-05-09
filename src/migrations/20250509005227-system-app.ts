import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.transaction(async trx => {

    await knex('principals').insert({
      identity: 'urn:uuid:5344f6b9-d98d-4541-a5d3-f67601e7c8e4',
      nickname: 'System App',
      type: 2, // App
      created_at: Date.now(),
      modified_at: Date.now(),
      active: 1,
      external_id: '$system',
      system: 1,
    });

    // Only reasonably way we can get the id reliably on all
    // database engines.
    const result = await knex('principals')
      .select('id')
      .where('external_id', '$system')
      .first();

    if (!result) { 
      throw new Error('Ehh');
    }

    await knex('app_clients').insert({
      client_id: '$system',
      client_secret: '',
      allowed_grant_types: '',
      user_id: result.id,
      require_pkce: 0,
    });

  });  

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('Reverting this migration is not supported.');

}
