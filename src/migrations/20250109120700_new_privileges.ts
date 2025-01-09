import { Knex } from 'knex';

const privilege = 'a12n:user:manage-identities';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege, description: 'Full control over a user identities, including adding, deleting, setting and removing verification status.'});

}

export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', [privilege]);

}

