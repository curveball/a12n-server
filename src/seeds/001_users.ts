import * as bcrypt from 'bcrypt';
import { generatePublicId } from '../crypto.ts';
import { Knex } from 'knex';
import { insertAndGetId } from '../database.ts';
const initialUsers = [
  {
    nickname: 'admin',
    given_name: 'Admin',
    family_name: 'User',
    privilege: 'admin',
    resource: '*',
    scope: '*',
    external_id: await generatePublicId(),
  },
  {
    nickname: 'apple',
    given_name: 'Apple',
    family_name: 'Cake',
    external_id: await generatePublicId(),
  },
  {
    nickname: 'banana',
    given_name: 'Banana',
    family_name: 'Bread',
    external_id: await generatePublicId(),
  },
  {
    nickname: 'cherry',
    given_name: 'Cherry',
    family_name: 'Tart',
    external_id: await generatePublicId(),
  }
] as const;

export async function seed(knex: Knex): Promise<void> {
  console.info('Seeding users...');

  for (const user of initialUsers) {
    // Insert principal and get the generated ID
    const principalId = await insertAndGetId('principals', {
      active: 1,
      nickname: user.nickname,
      type: 1,
      external_id: user.external_id,
      created_at: new Date().getTime(),
      modified_at: new Date().getTime(),
    });

    await knex('principal_identities').insert({
      principal_id: principalId,
      external_id: user.external_id,
      uri: `mailto:${user.nickname}@example.com`,
      is_primary: 1,
      created_at: new Date().getTime(),
      modified_at: new Date().getTime(),
      verified_at: new Date().getTime(),
    });

    // Use the principal_id for related tables
    await knex('user_info').insert({
      principal_id: principalId,
      name: `${user.given_name} ${user.family_name}`,
      given_name: user.given_name,
      family_name: user.family_name,
      locale: 'en-US',
    });

    await knex('user_passwords').insert({
      user_id: principalId,
      password: await bcrypt.hash('password123', 12)
    });
  }
  // Add admin privilege to admin user
  await knex('user_privileges').insert({
    user_id: 2,
    privilege: 'admin',
    resource: '*',
  });
  console.info('Seeding users complete!');
}
