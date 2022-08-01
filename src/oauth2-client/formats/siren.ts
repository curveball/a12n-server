import { App } from '../../principal/types';

type newClientQuery = {
 clientId?: string;
 allowGrantTypes?: string;
 redirectUris?: string;
}

export function newClient(user: App, query: newClientQuery ) {

  const memberHref = `/app/${user.id}`;

  let redirectUris: string = '';
  if (query.redirectUris) {
    let redirectUrisArray: Array<string> = [];
    redirectUrisArray = query.redirectUris.split(',');
    redirectUris = redirectUrisArray.join('\n');
  }

  let allowGrantTypes: Array<string> = [];
  if (query.allowGrantTypes) {
    allowGrantTypes = query.allowGrantTypes.split(',');
  }

  return {
    properties: {
      title: 'Add new OAuth2 Client',
    },
    links: [
      { rel: ['up'], href: `${memberHref}/client`, title: 'Back to list of clients'}
    ],
    actions: [
      {
        name: 'add-oauth2-client',
        title: 'Add new Client Credentials',
        method: 'POST',
        type: 'application/x-www-form-urlencoded',
        href: `${memberHref}/client`,
        fields: [
          {
            name: 'clientId',
            title: 'Client ID, leave blank to auto-generate',
            value: query.clientId
          },
          {
            name: 'allowAuthorizationCode',
            title: 'Allow "authorization_code" grant_type (for browser apps) ',
            type: 'checkbox',
            value: allowGrantTypes.includes('authorization_code')
          },
          {
            name: 'allowClientCredentials',
            title: 'Allow "client_credentials" grant_type (for server to server apps) ',
            type: 'checkbox',
            value: allowGrantTypes.includes('client_credentials')
          },
          {
            name: 'allowPassword',
            title: 'Allow "password" grant_type (trusted applications only)',
            type: 'checkbox',
            value: allowGrantTypes.includes('password')
          },
          {
            name: 'allowImplicit',
            title: 'Allow "implicit" grant_type (deprecated) ',
            type: 'checkbox',
            value: allowGrantTypes.includes('implicit')
          },
          {
            name: 'allowRefreshToken',
            title: 'Allow "refresh_token" grant_type',
            type: 'checkbox',
            value: allowGrantTypes.includes('refresh_token')
          },
          {
            name: 'redirectUris',
            title: 'Redirect Uris (1 per line)',
            type: 'textarea',
            value: redirectUris
          },
          {
            name: 'requirePkce',
            title: 'Require PKCE support (modern clients support this, but not everyone does)',
            type: 'checkbox',
            value: allowGrantTypes.includes('requirePkce')
          },
        ],
      }
    ],
  };

}
