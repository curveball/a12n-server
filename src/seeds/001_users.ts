import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {

  // Insert seed users
  const users = await knex('principals').insert([
    {
      active: true,
      created_at: new Date(),
      modified_at: new Date(),
      nickname: 'admin',
    },
    {
      active: true,
      created_at: new Date(),
      modified_at: new Date(),
      nickname: 'apple',
    },
    {
        active: true,
        created_at: new Date(),
        modified_at: new Date(),
        nickname: 'banana',
    },
    {
        active: true,
        created_at: new Date(),
        modified_at: new Date(),
        nickname: 'cherry',
    }
  ]).returning('id')

await knex('principal_identities').insert([
    {
      principal_id: users[0].id,
      identity: 'admin@example.com',
      is_primary: true,
      created_at: new Date(),
      modified_at: new Date(),
    },
    {
      principal_id: users[1].id,
      identity: 'apple@example.com',
      is_primary: true,
      created_at: new Date(),
      modified_at: new Date(),
    },
    {
      principal_id: users[2].id,
      identity: 'banana@example.com',
      is_primary: true,
      created_at: new Date(),
      modified_at: new Date(),
    },
    {
      principal_id: users[3].id,
      identity: 'cherry@example.com',
      is_primary: true,
      created_at: new Date(),
      modified_at: new Date(),
    },
  ]);

  // Insert user_info
  await knex('user_info').insert([
    {
      principal_id: users[0].id,
      name: 'Admin User',
      given_name: 'Admin',
      family_name: 'User',
      locale: 'en-US',
      created_at: new Date(),
      modified_at: new Date()
    },
    {
      principal_id: users[1].id,
      name: 'Apple Cake',
      given_name: 'Apple',
      family_name: 'Cake',
      locale: 'en-US',
      created_at: new Date(),
      modified_at: new Date()
    },
    {
      principal_id: users[2].id,
      name: 'Banana Bread',
      given_name: 'Banana',
      family_name: 'Bread',
      locale: 'en-US',
      created_at: new Date(),
      modified_at: new Date()
    },
    {
      principal_id: users[3].id,
      name: 'Cherry Tart',
      given_name: 'Cherry',
      family_name: 'Tart',
      locale: 'en-US',
      created_at: new Date(),
      modified_at: new Date()
    }  
  ]);

  // Insert passwords (hashed)
  const hashedPassword = await bcrypt.hash('password123', 12);
  await knex('user_passwords').insert([
    {
      principal_id: users[0].id,
      password: hashedPassword
    },
    {
      principal_id: users[1].id,
      password: hashedPassword
    },
    {
      principal_id: users[2].id,
      password: hashedPassword
    },
    {
      principal_id: users[3].id,
      password: hashedPassword
    }
  ]);
} 