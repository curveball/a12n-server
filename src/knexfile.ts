import { dirname } from 'node:path';
import { getSettings } from './database.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

if (process.env.PUBLIC_URI === undefined) {
  // If there's no PUBLIC_URI environment variable, it's a good indication
  // that we may be missing a .env file.
  //
  // This is the only required environment variable.
  dotenv.config({path: dirname(fileURLToPath(import.meta.url)) + '/../.env'});
}

const settings = getSettings();

export default {

  development: settings,

};
