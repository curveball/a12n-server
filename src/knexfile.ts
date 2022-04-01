import { getSettings } from './database';
import './env';

const settings = getSettings();

module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};
