import { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();
export async function seed(knex: Knex): Promise<void> {
  const corsAllowOrigin = process.env.CORS_ALLOW_ORIGIN;
  console.info('CORS_ALLOW_ORIGIN', corsAllowOrigin);

  console.info('Seeding cors.allowOrigin...');

  await knex('server_settings').where('setting', 'cors.allowOrigin').delete();
  await knex('server_settings').insert([
    {
      setting: 'cors.allowOrigin',
      value: `${corsAllowOrigin}`,
    },
  ]);
  console.info('Seeding cors.allowOrigin complete!');
}
