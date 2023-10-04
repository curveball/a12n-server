import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user_totp', table => {
    table
      .string('secret').notNullable().alter();
  });
  switch(knex().client.driverName) {
    case 'mysql' :
    case 'mysql2' :
      await knex.raw('ALTER TABLE oauth2_tokens CHANGE access_token access_token VARCHAR(2000) CHARACTER SET ascii NOT NULL');
      break;
    default:
      await knex.schema.alterTable('oauth2_tokens', table => {
        table.string('access_token', 2000).notNullable().alter();
      });
      break;
  }
}

export async function down(knex: Knex): Promise<void> {

  // Intentially let empty

}
