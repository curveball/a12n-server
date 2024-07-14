import 'knex';

declare module 'knex/types/tables.js' {

interface Tables {
  changelog: ChangelogRecord;
  group_members: GroupMembersRecord;
  oauth2_clients: Oauth2ClientsRecord;
  oauth2_codes: Oauth2CodesRecord;
  oauth2_redirect_uris: Oauth2RedirectUrisRecord;
  oauth2_tokens: Oauth2TokensRecord;
  principal_identity: PrincipalIdentityRecord;
  principals: PrincipalsRecord;
  privileges: PrivilegesRecord;
  server_settings: ServerSettingsRecord;
  user_app_permissions: UserAppPermissionsRecord;
  user_log: UserLogRecord;
  user_passwords: UserPasswordsRecord;
  user_privileges: UserPrivilegesRecord;
  user_totp: UserTotpRecord;
  user_webauthn: UserWebauthnRecord;
  verification_token: VerificationTokenRecord;
}


/**
 * This file is auto-generated and should not be edited.
 * It will be overwritten the next time types are generated.
 */

export type ChangelogRecord = {
  id: number;
  timestamp: number | null;
};
export type GroupMembersRecord = {
  user_id: number;
  group_id: number;
};
export type Oauth2ClientsRecord = {
  id: number;
  client_id: string;
  client_secret: string;
  allowed_grant_types: string;
  user_id: number;
  require_pkce: number;
};
export type Oauth2CodesRecord = {
  id: number;
  client_id: number;
  code: string;
  principal_id: number;
  code_challenge_method: 'plain' | 'S256' | null;
  code_challenge: string | null;
  created_at: number;
  browser_session_id: string | null;

  /**
   * OAuth2 scopes, space separated
   */
  scope: string | null;

  /**
   * OpenID Connect Nonce
   */
  nonce: string | null;
};
export type Oauth2RedirectUrisRecord = {
  id: number;
  oauth2_client_id: number;
  uri: string;
};
export type Oauth2TokensRecord = {
  id: number;
  oauth2_client_id: number;
  access_token: string;
  refresh_token: string;
  user_id: number;
  access_token_expires: number;
  refresh_token_expires: number;
  created_at: number;
  browser_session_id: string | null;

  /**
   * 1=implicit, 2=client_credentials, 3=password, 4=authorization_code, 5=authorization_code with secret,6=one-time-token
   */
  grant_type: number | null;

  /**
   * OAuth2 scopes, space separated
   */
  scope: string | null;
};
export type PrincipalIdentityRecord = {
  id: number;

  /**
   * The email address or phone number, specified as a URI
   */
  href: string;

  /**
   * Which principal this identity belongs to
   */
  principal_id: number;

  /**
   * Is this the primary user id
   */
  is_primary: number;

  /**
   * Optional, user supplied label for this id. For example, "work" or "home", or "mobile"
   */
  label: string | null;

  /**
   * When the identity was verified, for example through an email verification link. If set to null the identity has not been verified.
   */
  verified_at: number | null;

  /**
   * When the record was added
   */
  created_at: number;

  /**
   * When the record was last changed
   */
  modified_at: number;
};
export type PrincipalsRecord = {
  id: number;

  /**
   * Deprecated. Do not use. Will be deleted in a future version
   */
  identity: string | null;
  external_id: string;
  nickname: string | null;
  created_at: number;
  active: number;

  /**
   * 1 = user, 2 = app, 3 = group
   */
  type: number;
  modified_at: number;

  /**
   * System are built-in and cannot be deleted
   */
  system: number;
};
export type PrivilegesRecord = {
  privilege: string;
  description: string;
};
export type ServerSettingsRecord = {
  setting: string;
  value: string | null;
};
export type UserAppPermissionsRecord = {
  id: number;

  /**
   * Reference to the app / OAuth2 client
   */
  app_id: number;

  /**
   * User / Resource owner
   */
  user_id: number;

  /**
   * Scopes that were requested
   */
  scope: string | null;

  /**
   * When the user first gave permission to the app
   */
  created_at: number;

  /**
   * Last time the set of permissions were changed
   */
  modified_at: number;

  /**
   * Last time this application issued or refreshed an access token
   */
  last_used_at: number | null;
};
export type UserLogRecord = {
  id: number;
  time: number;
  user_id: number | null;
  event_type: number;
  ip: string;
  user_agent: string | null;
  country: string | null;
};
export type UserPasswordsRecord = {
  user_id: number;
  password: string;
};
export type UserPrivilegesRecord = {
  id: number;
  user_id: number;
  resource: string;
  privilege: string;
};
export type UserTotpRecord = {
  user_id: number;
  secret: string;
  failures: number;
  created: number;
};
export type UserWebauthnRecord = {
  id: number;
  user_id: number;
  credential_id: string;
  public_key: string;
  counter: number;
  created: number;
};
export type VerificationTokenRecord = {
  id: number;
  principal_id: number;

  /**
   * If set, this verification token is created to verify a principals identity (for example email or phone number
   */
  principal_identity_id: number | null;
  token: string;

  /**
   * If set to true, the token will become invalidated upon use
   */
  single_use: number;
  expires_at: number;
  created_at: number;
};


}
