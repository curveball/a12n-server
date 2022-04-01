import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 21});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 21,
    timestamp: Math.floor(Date.now()/1000)
  });

  switch(knex().client.driverName) {
    case 'mysql' :
      await knex.raw('ALTER TABLE oauth2_tokens CHANGE access_token access_token VARCHAR(2000) CHARACTER SET ascii');
      break;
    default:
      await knex.schema.alterTable('oauth2_tokens', table => {
        table.string('access_token', 2000).notNullable().alter();
      });
      break;
  }


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
