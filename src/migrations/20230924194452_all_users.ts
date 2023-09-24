import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('principals', table => {

    table
      .tinyint('system')
      .notNullable()
      .defaultTo(0)
      .comment('System principals are built-in and cannot be deleted');

  });

  await knex('principals').insert({
    identity: 'urn:uuid:5793d1ce-d21e-4955-9091-c2b9debb9ec1',
    nickname: 'All Users',
    created_at: Date.now(),
    active: 1,
    type: 3, // Group
    modified_at: Date.now(),
    external_id: '$all',
    system: 1,
  });

}


export async function down(knex: Knex): Promise<void> {

  throw new Error('Reverting this migration is not supported.');

}

