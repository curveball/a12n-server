import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {

  // Insert seed users
  const users = await knex('principals').insert([
    {
      active: 1,
      nickname: 'admin',
      type: 1,
      external_id: randomUUID().slice(0, 6),
      created_at: +new Date(),
      modified_at: +new Date(),
    },
    {
      active: 1,
      nickname: 'apple',
      type: 1,
      external_id: randomUUID().slice(0, 6),
      created_at: +new Date(),
      modified_at: +new Date(),
    },
    {
      active: 1,
      nickname: 'banana',
      type: 1,
      external_id: randomUUID().slice(0, 6),
      created_at: +new Date(),
      modified_at: +new Date(),
    },
    {
      active: 1,
      nickname: 'cherry',
      type: 1,
      external_id: randomUUID().slice(0, 6),
      created_at: +new Date(),
      modified_at: +new Date(),
    }
  ]).returning('id')

  // Insert user_info
  await knex('user_info').insert([
    {
      principal_id: users[0].id,
      name: 'Admin User',
      given_name: 'Admin',
      family_name: 'User',
      locale: 'en-US',
      modified_at: +new Date(),
    },
    {
      principal_id: users[1].id,
      name: 'Apple Cake',
      given_name: 'Apple',
      family_name: 'Cake',
      locale: 'en-US',
      modified_at: +new Date(),
    },
    {
      principal_id: users[2].id,
      name: 'Banana Bread',
      given_name: 'Banana',
      family_name: 'Bread',
      locale: 'en-US',
      modified_at: +new Date(),
    },
    {
      principal_id: users[3].id,
      name: 'Cherry Tart',
      given_name: 'Cherry',
      family_name: 'Tart',
      locale: 'en-US',
      modified_at: +new Date(),
    }
  ]);

  // Insert passwords (hashed)
  const hashedPassword = await bcrypt.hash('password123', 12);
  await knex('user_passwords').insert([
    {
      user_id: users[0].id,
      password: hashedPassword,
    },
    {
      user_id: users[1].id,
      password: hashedPassword,
    },
    {
      user_id: users[2].id,
      password: hashedPassword,
    },
    {
      user_id: users[3].id,
      password: hashedPassword,
    }
  ]);
}
