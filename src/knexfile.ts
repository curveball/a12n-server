import { getSettings } from './database';

const settings = getSettings();

module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};
