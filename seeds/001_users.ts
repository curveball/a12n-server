import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // First, delete existing entries to start fresh

  // Insert seed users
  const users = await knex('principals').insert([
    {
      identity: 'admin@example.com',
      active: true,
      created_at: new Date(),
      modified_at: new Date()
    },
    {
      identity: 'user1@example.com',
      active: true,
      created_at: new Date(),
      modified_at: new Date()
    },
    {
        identity: 'user2@example.com',
        active: true,
        created_at: new Date(),
        modified_at: new Date()
    },
    {
        identity: 'user3@example.com',
        active: true,
        created_at: new Date(),
        modified_at: new Date()
    }
  ]).returning('id');

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