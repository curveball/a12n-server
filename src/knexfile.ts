import { getSettings } from './database';
import { Knex } from 'knex';

import './env';

const settings = getSettings();


module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};
