import 'knex/types/tables';

/**
 * Sadly inferring these doesn't currently work. Need to research :(
 */
declare module 'knex/types/tables' {
  interface Principal {
    id: number;
    identity: string;
    type: number;
    external_id: string;
    nickname: string;
    created_at: number;
    modified_at: number;
    active: number;
  }

  interface OAuth2Client {
    id: number;
    client_id: string;
    client_secret: string;
    allowed_grant_types: string;
    user_id: number;
    require_pkce: number;
  }

  interface Tables {
    oauth2_clients: OAuth2Client;
    principals: Principal;
  }
}


