// Update with your config settings.
import { getSettings } from './src/database';

const settings = getSettings();

module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};
