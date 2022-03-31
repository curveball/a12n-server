import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: 5});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: 5,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE oauth2_redirect_uris (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  oauth2_client_id INT UNSIGNED NOT NULL,
  uri VARCHAR(300) NOT NULL
)`);
  await knex.raw(`INSERT INTO oauth2_redirect_uris (oauth2_client_id, uri) SELECT oauth2_client_id, url FROM oauth2_redirection_urls`);
  await knex.raw(`DROP TABLE oauth2_redirection_urls`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
