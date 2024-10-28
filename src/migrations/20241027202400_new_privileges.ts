import { Knex } from 'knex';

const privilege = 'a12n:access-token:generate';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege, description: 'Allows a user to create a valid access-token for another user without consent. This privilege allows full control of other accounts and should never be given to third parties.'});

}

export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', [privilege]);

}

