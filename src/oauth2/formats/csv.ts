import { OAuth2Token } from '../types';
import { OAuth2Client } from '../../oauth2-client/types';

import { stringify } from 'csv-stringify/sync';

export function activeSessions(tokens: OAuth2Token[], clients: Map<number, OAuth2Client>): string {

  return stringify(
    tokens.map( token => {
      return {
        Expires: new Date(token.refreshTokenExpires*1000).toString(),
        Client: token.clientId===0 ? 'System generated' : clients.get(token.clientId)?.app.nickname,
      };
    }),
    {
      header: true,
      columns: [
        'Expires',
        'Client',
      ],
    }
  );

}
