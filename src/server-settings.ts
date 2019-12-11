const settingsCache = new Map<string, any>();
let settingsLoaded = false;
import db from './database';

export function getSetting(setting: string, deflt?: any): any {

  if (!settingsLoaded) {
    throw new Error('Settings have not been loaded. Call load() first');
  }

  const value = settingsCache.get(setting);
  if (value === undefined) {
    if (deflt === undefined) {
      throw new Error('Setting not found');
    }
    return deflt;
  } else {
    return JSON.parse(value);
  }

}

/**
 * Loads or reloads settings from the database.
 */
export async function load(): Promise<void> {

  const query = 'SELECT setting, value FROM server_settings';
  const result = await db.query(query);

  for (const row of result[0]) {
    settingsCache.set(row.setting, row.value);
  }
  settingsLoaded = true;

}
