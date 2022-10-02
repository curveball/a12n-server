
declare module 'knex/types/tables' {

interface Tables {
  changelog: ChangelogRecord;
  group_members: GroupMembersRecord;
  oauth2_clients: Oauth2ClientsRecord;
  oauth2_codes: Oauth2CodesRecord;
  oauth2_redirect_uris: Oauth2RedirectUrisRecord;
  oauth2_tokens: Oauth2TokensRecord;
  principals: PrincipalsRecord;
  privileges: PrivilegesRecord;
  reset_password_token: ResetPasswordTokenRecord;
  server_settings: ServerSettingsRecord;
  user_log: UserLogRecord;
  user_passwords: UserPasswordsRecord;
  user_privileges: UserPrivilegesRecord;
  user_totp: UserTotpRecord;
  user_webauthn: UserWebauthnRecord;
}


/**
 * This file is auto-generated and should not be edited.
 * It will be overwritten the next time types are generated.
 */

export type ChangelogRecord = {
  id: number;
  timestamp: number | null;
}

export type GroupMembersRecord = {
  user_id: number;
  group_id: number;
}

export type Oauth2ClientsRecord = {
  id: number;
  client_id: string;
  client_secret: string;
  allowed_grant_types: string;
  user_id: number;
  require_pkce: number | null;
}

export type Oauth2CodesRecord = {
  id: number;
  client_id: number;
  code: string;
  principal_id: number;
  code_challenge: string | null;
  code_challenge_method: 'plain' | 'S256' | null;
  created_at: number;
  browser_session_id: string | null;

  /**
   * OAuth2 scopes, space separated
   */
  scope: string | null;
}

export type Oauth2RedirectUrisRecord = {
  id: number;
  oauth2_client_id: number;
  uri: string;
}

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
   * 1=implicit, 2=client_credentials, 3=password, 4=authorization_code, 5=authorization_code with secret
   */
  grant_type: number | null;

  /**
   * OAuth2 scopes, comma separated
   */
  scope: string | null;
}

export type PrincipalsRecord = {
  id: number;
  identity: string;
  external_id: string;
  nickname: string | null;
  created_at: number;
  active: number;

  /**
   * 1 = user, 2 = app
   */
  type: number;
  modified_at: number;
}

export type PrivilegesRecord = {
  privilege: string;
  description: string;
}

export type ResetPasswordTokenRecord = {
  id: number;
  user_id: number;
  token: string;
  expires_at: number;
  created_at: number;
}

export type ServerSettingsRecord = {
  setting: string;
  value: string | null;
}

export type UserLogRecord = {
  id: number;
  time: number;
  user_id: number | null;
  event_type: number;
  ip: string;
  user_agent: string | null;
  country: string | null;
}

export type UserPasswordsRecord = {
  user_id: number;
  password: string;
}

export type UserPrivilegesRecord = {
  id: number;
  user_id: number;
  resource: string;
  privilege: string;
}

export type UserTotpRecord = {
  user_id: number;
  secret: string;
  failures: number;
  created: number;
}

export type UserWebauthnRecord = {
  id: number;
  user_id: number;
  credential_id: string;
  public_key: string;
  counter: number;
  created: number;
}



}
