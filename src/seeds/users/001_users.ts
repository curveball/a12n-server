import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';

const initialUsers = [
  {
    nickname: 'admin',
    given_name: 'Admin',
    family_name: 'User',
    privilege: 'admin',
    resource: '*',
    scope: '*',
    external_id: randomUUID().slice(0, 6),
  },
  {
    nickname: 'apple',
    given_name: 'Apple',
    family_name: 'Cake',
    external_id: randomUUID().slice(0, 6),
  },
  {
    nickname: 'banana',
    given_name: 'Banana',
    family_name: 'Bread',
    external_id: randomUUID().slice(0, 6),
  },
  {
    nickname: 'cherry',
    given_name: 'Cherry',
    family_name: 'Tart',
    external_id: randomUUID().slice(0, 6),
  },
] as const;

export async function seed(knex: Knex): Promise<void> {
  console.log('Seeding users...');

  await knex.schema.dropTableIfExists('principals');
  await knex.schema.dropTableIfExists('principal_identities');
  await knex.schema.dropTableIfExists('user_info');
  await knex.schema.dropTableIfExists('user_passwords');
  await knex.schema.dropTableIfExists('user_privileges');

  for (const user of initialUsers) {
    // Insert principal and get the generated ID
    const [principal] = await knex('principals')
      .insert({
        active: 1,
        nickname: user.nickname,
        type: 1,
        external_id: user.external_id,
        created_at: new Date().getTime(),
        modified_at: new Date().getTime(),
      })
      .returning('id');

    await knex('principal_identities').insert({
      principal_id: principal.id,
      external_id: user.external_id,
      uri: `mailto:${user.nickname}@example.com`,
      is_primary: 1,
      created_at: new Date().getTime(),
      modified_at: new Date().getTime(),
      verified_at: new Date().getTime(),
    });

    // Use the principal_id for related tables
    await knex('user_info').insert({
      principal_id: principal.id,
      name: `${user.given_name} ${user.family_name}`,
      given_name: user.given_name,
      family_name: user.family_name,
      locale: 'en-US',
    });

    await knex('user_passwords').insert({
      user_id: principal.id,
      password: await bcrypt.hash('password123', 12)
    });
  }

  await knex('user_privileges').insert({
    user_id: 2,
    privilege: 'admin',
    resource: '*',
  });
}
