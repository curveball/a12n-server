// @ts-nocheck  old migrations become out of date with the schema, so we just turn type checking off.
import { Knex } from 'knex';
import { generatePublicId } from '../crypto.ts';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('principal_identities', table => {

    table
      .renameColumn('href', 'uri');

    table
      .string('external_id', 11)
      .comment('Unique ID used externally in the API')
      .after('id');

  });

  const identites = await knex('principal_identities')
    .select(['id']);

  for(const identity of identites) {
    await knex('principal_identities')
      .update({external_id: await generatePublicId()})
      .where('id', identity.id);
  }

  await knex.schema.alterTable('principal_identities', table => {

    table
      .string('external_id', 11)
      .alter()
      .notNullable();

  });
}

export async function down(knex: Knex): Promise<void> {

  await knex.schema.alterTable('principal_identities', table => {

    table
      .renameColumn('uri', 'href');

    table
      .dropColumn('external_id');

  });


}
