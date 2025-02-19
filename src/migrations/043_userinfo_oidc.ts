import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

    const result = await knex('changelog').select('id').where({ id: 43 });

    if (result.length) {
        // Migration has been applied using the old patch system
        return;
    }

    await knex('changelog').insert({
        id: 43,
        timestamp: Math.floor(Date.now() / 1000)
    });

    await knex.schema.createTable('user_info', table => {
        table.increments()
        table.string('sub', 50).notNullable()
        table.string('name', 200).nullable()
        table.string('email', 100).nullable()
        table.string('given_name', 30).nullable()
        table.string('family_name', 30).nullable()
        table.string('nickname').nullable()
        table.string('profile', 2048).nullable()
        table.binary('picture').nullable()
        table.integer('updated_at').unsigned().nullable()
        table.boolean('email_verified').nullable()
        table.string('phone_number', 200).nullable()
        table.boolean('phone_number_verified').nullable()
        table.string('website', 300).nullable().checkRegex('^(http://|https://).*$')
        table.json('address').nullable()
        table.enu('gender', ['male', 'female', 'other']).nullable()
        table.string('locale', 5).nullable()
        table.string('zoneinfo').nullable()
        table.foreign('user_id').references('id').inTable('principals');
      });
    
}
    
export async function down(knex: Knex): Promise<void> {

    throw new Error('This migration doesn\'t have a "down" script');
  
  }