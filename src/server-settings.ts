import db from './database.ts';

export type Settings = {
  'login.defaultRedirect': string;
  'registration.enabled': boolean;
  'registration.mfa.enabled': boolean;
  'cors.allowOrigin': string[] | null;
  'seed.users': boolean | null;
  /*
  'db.driver': 'mysql2' | 'pg' | 'sqlite3' | 'mysql';
  'db.host': string | null;
  'db.user': string;
  'db.password': string | null;
  'db.database': string;
  'db.filename': string;
  'db.mysql_instance_connection_name': string | null;
  */

  'redis.uri': null | string;

  'smtp.url': null | string;
  'smtp.emailFrom': null | string;

  'oauth2.code.expiry': number;
  'oauth2.accessToken.expiry': number;
  'oauth2.refreshToken.expiry': number;

  'oidc.idToken.expiry': number;

  'jwt.privateKey': string | null;

  'totp': 'enabled' | 'required' | 'disabled';
  'totp.serviceName': string;
  'webauthn': 'enabled' | 'disabled' | 'required';
  'webauthn.expectedOrigin': string | null;
  'webauthn.relyingPartyId': string | null;
  'webauthn.serviceName': string;
  'logo_url': string;
  'app_name': string;


}

export type SettingsRules = {
  [Setting in keyof Settings]: {
    description: string;
    env?: string;
    fromDb: boolean;
    isSecret?: boolean;
    default: Settings[Setting];
  }
}

export const settingsRules: SettingsRules = {
  'logo_url' : {
    description: 'The application logo to display on the a12nserver pages',
    fromDb: true,
    default: '/_hal-browser/assets/curveball-logo.svg'
  },
  'app_name' : {
    description: 'Application name to display on admin pages and emails.',
    fromDb: true,
    env: 'APP_NAME',
    default: 'a12n-server'
  },
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
  'registration.mfa.enabled': {
    description: 'Whether MFA/2FA is enabled.',
    fromDb: true,
    default: true,
  },
  'redis.uri': {
    description: 'Redis server URI',
    fromDb: false,
    default: null,
    env: 'REDIS_URI',
  },
  'cors.allowOrigin': {
    description: 'List of allowed origins that may directly talk to the server. This should only ever be 1st party, trusted domains. By default CORS is not enabled',
    fromDb: true,
    default: null,
  },
  /*
  'db.driver': {
    description: 'Database client to use. Only "pg", "sqlite3" and "mysql" are supported',
    fromDb: false,
    default: 'sqlite3',
    env: 'DB_CLIENT',
  },

  'db.host': {
    description: 'Database hostname. Required for postgres and mysql2, but must be omitted for sqlite',
    fromDb: false,
    default: null,
    env: 'DB_HOST',
  },

  'db.user': {
    description: 'Database user. Required for postgres and mysql2.',
    fromDb: false,
    default: 'a12nserver',
    env: 'DB_USER',
  },

  'db.password': {
    description: 'Database password',
    fromDb: false,
    default: null,
    env: 'DB_PASSWORD',
    isSecret: true,
  },

  'db.database': {
    description: 'Name of the database. Required for postgres and mysql2',
    fromDb: false,
    default: 'a12nserver',
    env: 'DB_DATABASE',
  },

  'db.mysql_instance_connection_name': {
    description: 'MySQL instance connection name. This environment variable allows a Google Cloud installation to automatically discover the MySQL instance, and should normally not be provided manually',
    fromDb: false,
    default: null,
    env: 'MYSQL_INSTANCE_CONNECTION_NAME',
  },


  'db.filename': {
    description: 'Path to database. Only used by sqlite3 driver',
    fromDb: false,
    default: ':memory:',
    env: 'DB_FILENAME',
  },
  */
  'seed.users': {
    description: 'Whether to seed the database with dummy users',
    fromDb: true,
    default: false,
    env: 'SEED_USERS',
  },
  'smtp.url' : {
    description: 'The url to the SMTP server. See the node-mailer documentation for possible values',
    env: 'SMTP_URL',
    fromDb: true,
    default: null,
  },
  'smtp.emailFrom' : {
    description: 'The "from" address that should be used for all outgoing emails',
    env: 'SMTP_EMAIL_FROM',
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
  'oidc.idToken.expiry' : {
    description: 'OpenID Connect ID Token expiry time (in seconds)',
    env: 'OICD_IDTOKEN_EXPIRY',
    fromDb: true,
    default: 3600*10,
  },

  'jwt.privateKey': {
    description: 'The RSA private key to sign JWT access tokens. Usually this value has the contents of a .pem file. If not set, JWT will be disabled',
    env: 'JWT_PRIVATE_KEY',
    fromDb: false,
    default: null,
    isSecret: true,
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
 * Retrieves the value of a single setting, by name.
 *
 * If the setting was not provided (null) this function will throw an exception.
 */
export function requireSetting<T extends keyof Settings>(setting: T): Settings[T] {

  if (settingsCache === null) {
    throw new Error('Settings have not been loaded. Call load() first');
  }
  const value = settingsCache[setting];
  const info = settingsRules[setting];

  if (value === null) {

    let msg = `A value for the setting "${setting}" must be provided for this feature to work. `;
    if (info.fromDb && info.env) {
      msg+=`You should either set the "${setting}" setting in the database, or provide a value with the "${info.env}" environment variable.`;
    } else if (info.fromDb) {
      msg+=`You should set the "${setting}" setting in the database.`;
    } else if (info.env) {
      msg+=`You should provide a value with the "${info.env}" environment variable.`;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      msg+'There is literally no way to actually do this, and this is a bug. DM me for a prize.';
    }
    throw new Error(msg);
  }

  return value;

}

export function getSettings(): Settings {

  if (settingsCache === null) {
    throw new Error('Settings have not been loaded. Call load() first');
  }

  return settingsCache;
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
  ) as any;

  console.info('Loading settings');
  const result = await db('server_settings').select('*');

  for (const row of result) {

    if (!isValidSettingName(row.setting)) {

      console.warn('Unknown setting in database: %s. We ignored it.', row.setting);
      continue;
    }

    if (!(settingsRules as any)[row.setting].fromDb) {

      console.warn('The setting %s may not be set from the database. We ignored it');
      continue;
    }
    (settings as any)[row.setting] = row.value!==null ? JSON.parse(row.value): null;

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
