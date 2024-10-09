import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_login_activity', (table) => {
    table
      .integer('principal_id')
      .unsigned()
      .notNullable()
      .primary()
      .comment('Foreign key to the ‘principals’ table, representing the user');
    table
      .foreign('principal_id')
      .references('id')
      .inTable('principals')
      .onDelete('CASCADE');
    table
      .integer('failed_login_attempts')
      .unsigned()
      .defaultTo(0)
      .notNullable()
      .comment('Tracks the number of consecutive failed login attempts');
    table
      .boolean('account_locked')
      .defaultTo(false)
      .notNullable()
      .comment(
        "Indicates if the user's account is currently locked due to suspicious activity, such as too many failed login attempts"
      );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user_login_activity');
}
