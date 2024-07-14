import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable('principal_identity', table => {

    table.increments('id');
    table
      .string('href', 200)
      .unique()
      .comment('The email address or phone number, specified as a URI')
      .notNullable();

    table
      .integer('principal_id')
      .unsigned()
      .notNullable()
      .references('principals.id')
      .comment('Which principal this identity belongs to');

    table
      .tinyint('is_primary')
      .unsigned()
      .notNullable()
      .comment('Is this the primary user id');

    table
      .string('label', 50)
      .nullable()
      .comment('Optional, user supplied label for this id. For example, "work" or "home", or "mobile"');

    table
      .bigint('verified_at')
      .nullable()
      .comment('When the identity was verified, for example through an email verification link. If set to null the identity has not been verified.');

    table
      .bigint('created_at')
      .comment('When the record was added')
      .unsigned()
      .notNullable();

    table
      .bigint('modified_at')
      .comment('When the record was last changed')
      .unsigned()
      .notNullable();

  });

  const principals = await knex('principals')
    .select();

  for(const principal of principals) {

    await knex('principal_identity').insert({
      principal_id: principal.id,
      href: principal.identity,
      is_primary: 1,
      verified_at: principal.active ? Date.now() : null,
      created_at: principal.created_at,
      modified_at: principal.modified_at,
    });

  }

  // The 'identity' field is no longer used, but we are not deleting it yet
  // for safety reasons. We are however making it nullable and remove the
  // unique constraint.
  await knex.schema.alterTable('principals', table => {

    table.dropUnique(['identity'], 'users_identity_unique');
    table
      .string('identity')
      .nullable()
      .comment('Deprecated. Do not use. Will be deleted in a future version')
      .alter();

  });

  await knex.schema.renameTable('reset_password_token', 'verification_token');

  await knex.schema.alterTable('verification_token', table => {

    table.renameColumn('user_id', 'principal_id');

  });

  await knex.schema.alterTable('verification_token', table => {

    table.tinyint('single_use')
      .notNullable()
      .comment('If set to true, the token will become invalidated upon use')
      .after('token')
      .defaultTo(0);

    table.integer('principal_identity_id')
      .nullable()
      .comment('If set, this verification token is created to verify a principals identity (for example email or phone number')
      .after('principal_id');

  });

}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.dropTable('principal_identity');

  // The 'identity' field is no longer used, but we are not deleting it yet
  // for safety reasons. We are however making it nullable and remove the
  // unique constraint.
  await knex.schema.alterTable('principals', table => {

    table.unique(['identity'], {indexName: 'users_identity_unique'});
    table
      .string('identity')
      .notNullable()
      .alter();

  });

  await knex.schema.alterTable('verification_token', table => {

    table.renameColumn('principal_id', 'user_id');
    table.dropColumn('single_use');
    table.dropColumn('principal_identity_id');

  });
  await knex.schema.renameTable('verification_token', 'reset_password_token');

}
