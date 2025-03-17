import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';

const initialUsers = [
  {
    nickname: 'admin',
    given_name: 'Admin',
    family_name: 'User',
  },
  {
    nickname: 'apple',
    given_name: 'Apple',
    family_name: 'Cake',
  },
  {
    nickname: 'banana',
    given_name: 'Banana',
    family_name: 'Bread',
  },
  {
    nickname: 'cherry',
    given_name: 'Cherry',
    family_name: 'Tart',
  },
] as const;

export async function seed(knex: Knex): Promise<void> {
  for (const user of initialUsers) {
    // Insert principal and get the generated ID
    const [principal] = await knex('principals')
      .insert({
        active: 1,
        nickname: user.nickname,
        type: 1,
        external_id: randomUUID().slice(0, 6),
        created_at: new Date().getTime(),
        modified_at: new Date().getTime(),
      })
      .returning('id');

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
}
