import { getSettings } from './database';
import './env';

const settings = getSettings();

module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};

declare module 'knex/types/tables' {

  interface GroupMember {
    user_id: number;
    group_id: number;
  }

  interface OAuth2Client {
    id: number;
    client_id: string;
    client_secret: string;
    allowed_grant_types: string;
    user_id: number;
  }

  interface OAuth2Token {
    id: number;
    oauth2_client_id: number;
    access_token: string;
    refresh_token: string;
    user_id: number;
    access_token_expires: number;
    refresh_token_expires: number;
    created: number;
    browser_session_id: string | null;
  }

  interface Principal {
    id: number;
    identity: string;
    type: number;
    nickname: string;
    created_at: number;
    modified_at: number;
    active: number;
  }

  interface ServerSetting {
    setting: string;
    value: string;
  }

  interface UserLog {
    id: number;
    time: number;
    user_id: number | null;
    event_type: number;
    ip: string;
    user_agent: string | null;
    country: string | null;
  }

  interface UserTotp {
    user_id: number;
    secret: string;
    failures: number;
    created: number;
  }

  interface Tables {
    group_members: GroupMember;
    oauth2_clients: OAuth2Client;
    oauth2_tokens: OAuth2Token;
    principals: Principal;
    server_settings: ServerSetting;
    user_log: UserLog;
    user_totp: UserTotp;
  }
}
