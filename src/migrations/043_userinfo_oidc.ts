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
        table.foreign('user_id').references('id').inTable('principals');
        table.string('sub', 50).notNullable()
        table.string('name', 200).nullable()
        table.string('email', 100).nullable()
        table.boolean('email_verified').nullable()
        table.string('middle_name').nullable()
        table.string('given_name', 30).nullable()
        table.string('family_name', 30).nullable()
        // TODO: Check validation
        table.date('birthdate').nullable()
        table.string('nickname').nullable()
        table.string('preferred_username', 100).nullable()
        table.string('profile', 2048).nullable()
        table.string('picture').nullable().checkRegex('^(http://|https://).+\\.(png|jpeg|jpg|gif).*$')
        table.integer('updated_at').unsigned().nullable()
        table.string('phone_number', 200).nullable()
        table.boolean('phone_number_verified').nullable()
        table.string('website', 300).nullable().checkRegex('^(http://|https://).*$')
        // TODO: Check for right way to add JSON properties
        table.json('address').defaultTo({
            "formatted": '',
            "street_address": '',
            "locality": '',
            "region": '',
            "postal_code": '',
            "country": ''
        })
        table.enu('gender', ['male', 'female', 'other']).nullable()
        table.string('locale', 5).nullable().checkRegex('^[a-z]{2}-[A-Z]{2}$')
        table.string('zoneinfo').nullable()
      });
    
}
    
export async function down(knex: Knex): Promise<void> {

    throw new Error('This migration doesn\'t have a "down" script');
  
  }