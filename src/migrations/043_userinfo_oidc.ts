import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({ id: 43 });

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }

    await knex.schema.createTable('user_info', table => {
        table.increments()
        table.string('sub', 50).notNullable()
        table.string('name', 200).nullable()
        table.string('middle_name').nullable()
        table.string('given_name', 30).nullable()
        table.string('family_name', 30).nullable()
        table.date('birthdate').nullable()
        table.string('picture').nullable()
        table.integer('updated_at').unsigned().nullable()
        table.text('address').nullable()
        table.string('locale', 5).nullable()
        table.string('zoneinfo').nullable()
        table.text('metadata')
      });
    
}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\'t have a "down" script');

}
