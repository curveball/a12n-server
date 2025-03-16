import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {

  // Insert seed users
  const users = await knex('principals').insert([
    {
      active: 1,
      created_at: +new Date(),
      modified_at: +new Date(),
      nickname: 'admin',
      type: 1,
      external_id: `admin-${randomUUID()}`,
    },
    {
      active: 1,
      created_at: +new Date(),
      modified_at: +new Date(),
      nickname: 'apple',
      type: 1,
      external_id: `apple-${randomUUID()}`,
    },
    {
      active: 1,
      created_at: +new Date(),
      modified_at: +new Date(),
      nickname: 'banana',
      type: 1,
      external_id: `banana-${randomUUID()}`,
    },
    {
      active: 1,
      created_at: +new Date(),
      modified_at: +new Date(),
      nickname: 'cherry',
      type: 1,
      external_id: `cherry-${randomUUID()}`
    }
  ]).returning('id');

  // Insert principal_identities
  await knex('principal_identities').insert(users.map((user, index) => {
    const uris = ['mailto:admin@example.com', 'mailto:apple@example.com', 'mailto:banana@example.com', 'mailto:cherry@example.com'][index];
    return {
      principal_id: user.id,
      uri: uris,
      is_primary: 1,
      is_mfa: 0,
      external_id: users[index]?.external_id,
      created_at: +new Date(),
      modified_at: +new Date()
    };
  }));

  // Insert user_info
  await knex('user_info').insert(users.map((user, idx) => {
    const names = ['Admin User', 'Apple Cake', 'Banana Bread', 'Cherry Tart'][idx];
    const [given_name, family_name] = names.split(' ');
    return {
      principal_id: user.id,
      name: names,
      given_name,
      family_name,
      locale: 'en-US',
      created_at: +new Date(),
      modified_at: +new Date()
    };
  }));

  // Insert passwords (hashed)
  const hashedPassword = await bcrypt.hash('password123', 12);
  await knex('user_passwords').insert(users.map(user => ({
    user_id: user.id,
    password: hashedPassword
  })));
} 