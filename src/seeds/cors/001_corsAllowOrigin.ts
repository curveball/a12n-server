import { Knex } from 'knex';

import { getSetting } from '../../server-settings.js';

const corsAllowOrigin = getSetting('cors.allowOrigin');

export async function seed(knex: Knex): Promise<void> {
    console.log('Seeding cors.allowOrigin');
    await knex('server_settings').where('setting', 'cors.allowOrigin').delete();
    await knex('server_settings').insert([
        {
            setting: 'cors.allowOrigin',
            value: corsAllowOrigin,
        },
    ]);
}
