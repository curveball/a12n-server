import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  if (await knex.schema.hasTable('changelog')) {
    // This migration has been applied
    return;
  }

  await knex.schema.createTable('changelog', table => {

    table.integer('id').unsigned().primary();
    table.integer('timestamp').unsigned();

  });

  await knex('changelog').insert({
    id: 1,
    timestamp: Math.floor(Date.now()/1000)
  });

  await knex.raw(`CREATE TABLE users (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  identity VARCHAR(200) NOT NULL,
  nickname VARCHAR(100),
  created INT UNSIGNED NOT NULL,
  active BOOL NOT NULL DEFAULT '0',
  UNIQUE(identity)
)`);
  await knex.raw(`CREATE TABLE users_auth_log (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  time INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  event_type TINYINT UNSIGNED NOT NULL
)`);
  await knex.raw(`CREATE TABLE user_passwords (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  password VARBINARY(60) NOT NULL
)`);
  await knex.raw(`CREATE TABLE user_totp (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  secret VARCHAR(50),
  failures TINYINT UNSIGNED NOT NULL DEFAULT '0',
  UNIQUE(user_id)
)`);


}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
