import { Knex } from 'knex';

const privilege = 'a12n:verify-uri';

export async function up(knex: Knex): Promise<void> {
  await knex('privileges')
    .insert({privilege, description: 'Allows sending one-time codes to verify ownership of a URI (email or phone)'});

}

export async function down(knex: Knex): Promise<void> {

  await knex('privileges')
    .delete()
    .whereIn('privileges', [privilege]);

} 