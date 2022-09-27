import { getSettings } from './database';
import * as dotenv from 'dotenv';

if (process.env.PUBLIC_URI === undefined) {
  // If there's no PUBLIC_URI environment variable, it's a good indication
  // that we may be missing a .env file.
  //
  // This is the only required environment variable.
  dotenv.config({path: __dirname + '/../.env'});
}

const settings = getSettings();

module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};
