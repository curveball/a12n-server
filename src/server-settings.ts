type Settings = {
  'cors.allowOrigin': string[] | null,
  'oauth2.code.expiry': number,
  'oauth2.accessToken.expiry': number,
  'oauth2.refreshToken.expiry': number,
  'registration.enabled': boolean,
  'registration.mfa.enabled': boolean,
  'totp': 'enabled' | 'required' | 'disabled',
  'totp.serviceName': string,
  'webauthn': 'enabled' | 'disabled' | 'required',
  'webauthn.expectedOrigin': string,
  'webauthn.relyingPartyId': string,
  'webauthn.serviceName': string,
  'login.defaultRedirect': string,
}

const settingsCache = new Map<string, any>();
let settingsLoaded = false;
import db from './database';

export function getSetting<T extends keyof Settings>(setting: T, deflt?: Settings[T]): Settings[T] {

  if (!settingsLoaded) {
    throw new Error('Settings have not been loaded. Call load() first');
  }

  const value = settingsCache.get(setting);
  if (value === undefined || value === null) {
    if (deflt === undefined) {
      throw new Error(`Setting ${setting} not found`);
    }
    return deflt;
  } else {
    return value;
  }

}

/**
 * Loads or reloads settings from the database.
 */
export async function load(): Promise<void> {

  const query = 'SELECT setting, value FROM server_settings';
  const result = await db.query(query);

  for (const row of result[0]) {
    settingsCache.set(row.setting, JSON.parse(row.value));
  }
  settingsLoaded = true;

}
