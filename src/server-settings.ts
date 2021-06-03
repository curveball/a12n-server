import db from './database';

type Settings = {
  'login.defaultRedirect': string;
  'cors.allowOrigin': string[] | null;

  'smtp.url': null | string;
  'smtp.emailFrom': null | string;

  'oauth2.code.expiry': number;
  'oauth2.accessToken.expiry': number;
  'oauth2.refreshToken.expiry': number;
  'registration.enabled': boolean;
  'registration.mfa.enabled': boolean;
  'totp': 'enabled' | 'required' | 'disabled';
  'totp.serviceName': string;
  'webauthn': 'enabled' | 'disabled' | 'required';
  'webauthn.expectedOrigin': string | null;
  'webauthn.relyingPartyId': string | null;
  'webauthn.serviceName': string;

}

type SettingsRules = {
  [Setting in keyof Settings]: {
    description: string;
    env?: string;
    fromDb: boolean;
    isSecret?: boolean;
    default: Settings[Setting];
  }
}

const settingsRules: SettingsRules = {

  'login.defaultRedirect': {
    description: 'This is the url that the user will be redirected to after the log in to a12nserver, and no other redirect_uri is provided by the application. It\'s a good idea to set this to your application URL',
    fromDb: true,
    default: '/',
  },
  'registration.enabled': {
    description: 'Allow users to register new accounts. By default new accounts will be disabled and have no permissions.',
    env: 'REGISTRATION_ENABLED',
    fromDb: true,
    default: true,
  },

  'smtp.url' : {
    description: 'The url to the SMTP server. See the node-mailer documentation for possible values',
    env: 'SMTP_URL',

    // There's no reason this can't be in the DB, but code using this setting just needs to
    // be changed to use the settings api.
    fromDb: false,
    default: null,
  },
  'smtp.emailFrom' : {
    description: 'The "from" address that should be used for all outgoing emails',
    env: 'SMTP_EMAIL_FROM',

    // There's no reason this can't be in the DB, but code using this setting just needs to
    // be changed to use the settings api.
    fromDb: false,
    default: null,
  },

  'cors.allowOrigin': {
    description: 'List of allowed origins that may directly talk to the server. This should only ever be 1st party, trusted domains. By default CORS is not enabled',
    fromDb: true,
    default: null,
  },

  'oauth2.code.expiry': {
    description: 'The expiry time (in seconds) for the \'code\' from the oauth2 authorization code grant type',
    env: 'OAUTH2_CODE_EXPIRY',
    fromDb: true,
    default: 600,
  },
  'oauth2.accessToken.expiry': {
    description: 'The expiry time (in seconds) for OAuth2 access token.',
    env: 'OAUTH2_ACCESSTOKEN_EXPIRY',
    fromDb: true,
    default: 600
  },
  'oauth2.refreshToken.expiry': {
    description: 'The expiry time (in seconds) for OAuth2 refresh tokens.',
    env: 'OAUTH2_REFRESHTOKEN_EXPIRY',
    fromDb: true,
    default: 3600*6,
  },

  'registration.mfa.enabled': {
    description: 'Whether MFA/2FA is enabled.',
    fromDb: true,
    default: true,
  },

  'totp': {
    description: 'Whether TOTP is enabled. TOTP uses authenticator apps like Google Authenticator and Authy. This can be set to "enabled", "disabled", and "required"',
    fromDb: true,
    default: 'enabled',
  },
  'totp.serviceName': {
    description: 'The name of the application that should show up in authenticator apps' ,
    fromDb: true,
    default: 'a12n-server API',
  },

  'webauthn': {
    description: 'Whether webauthn is "enabled", "disabled" or "required".',
    fromDb: true,
    default: 'enabled',
  },
  'webauthn.serviceName': {
    description: 'The service name that should appear in Webauthn dialogs.',
    fromDb: true,
    default: 'a12n-server',
  },
  'webauthn.expectedOrigin': {
    description: 'The "origin" of this server. This must be set for webauthn to work',
    fromDb: true,
    default: null,
  },
  'webauthn.relyingPartyId': {
    description: 'The origin of the application performing the login.',
    fromDb: true,
    default: null,
  },

};



let settingsCache: Settings | null = null;

/**
 * Retrieves the value of a single setting, by name
 */
export function getSetting<T extends keyof Settings>(setting: T): Settings[T] {

  if (settingsCache === null) {
    throw new Error('Settings have not been loaded. Call load() first');
  }
  return settingsCache[setting];

}

/**
 * Loads or reloads settings from the database.
 */
export async function load(): Promise<void> {

  // Load defaults first
  const settings: Settings = Object.fromEntries(
    Object.entries(settingsRules).map( ([settingName, settingInfo]) => {
      return [
        settingName,
        settingInfo.default
      ];
    })
  ) as Settings;

  // Load database values next
  const query = 'SELECT setting, value FROM server_settings';
  const result: {setting: string; value: string}[] = (await db.query(query))[0];

  for (const row of result) {

    if (!isValidSettingName(row.setting)) {
      // eslint-disable-next-line no-console
      console.warn('Unknown setting in database: %s. We ignored it.', row.setting);
      continue;
    }

    if (!settingsRules[row.setting].fromDb) {
      // eslint-disable-next-line no-console
      console.warn('The setting %s may not be set from the database. We ignored it');
      continue;
    }

  }

  // Load settings from environment
  for (const [settingName, settingInfo] of Object.entries(settingsRules)) {
    if (!settingInfo.env) {
      continue;
    }
    if (process.env[settingInfo.env]) {

      const envValue = process.env[settingInfo.env]!;
      let value;
      switch(settingName) {
        case 'registration.enabled': {
          value = !['false','0','no'].includes(envValue);
          break;
        }
        default :
          value = envValue;
      }

      // A setting was passed via the environment. That setting wins!
      (settings as any)[settingName] = value;
    }
  }

  settingsCache = settings;
}


function isValidSettingName(name: string): name is keyof Settings {
  return name in settingsRules;
}
