import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * This file exists to ensure that .env is loaded as early as possible.
 * Anything that needs it should import it
 */
import * as dotenv from 'dotenv';

if (process.env.PUBLIC_URI === undefined) {
  // If there's no PUBLIC_URI environment variable, it's a good indication
  // that we may be missing a .env file.
  //
  // This is the only required environment variable.
  if(process.env.NODE_ENV === 'test'){
    dotenv.config({ path: './.env.test' });
  }
  else{
    dotenv.config({path: dirname(fileURLToPath(import.meta.url)) + '/../.env'});
  }

} else {
  console.warn('/env.js was loaded twice?');
}
