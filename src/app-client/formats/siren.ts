import { App } from '../../types.js';

type NewClientQuery = {
 clientId?: string;
 allowedGrantTypes?: string;
 redirectUris?: string;
 requirePkce?: string;
}

export function newClient(user: App, query: NewClientQuery ) {

  const memberHref = user.href;

  const redirectUris = query.redirectUris ? query.redirectUris.split(',').join('\n') : '';
  const allowedGrantTypes = query.allowedGrantTypes ? query.allowedGrantTypes.split(',') : [];

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
            value: allowedGrantTypes.includes('authorization_code')
          },
          {
            name: 'allowClientCredentials',
            title: 'Allow "client_credentials" grant_type (for server to server apps) ',
            type: 'checkbox',
            value: allowedGrantTypes.includes('client_credentials')
          },
          {
            name: 'allowPassword',
            title: 'Allow "password" grant_type (trusted applications only!)',
            type: 'checkbox',
            value: allowedGrantTypes.includes('password')
          },
          {
            name: 'allowAuthorizationChallenge',
            title: 'Allow "OAuth 2.0 Authorization Challenge for First-Party applications" flow (experimental and only for trusted applications!)',
            type: 'checkbox',
            value: allowedGrantTypes.includes('allowAuthorizationChallenge')
          },
          {
            name: 'allowImplicit',
            title: 'Allow "implicit" grant_type (deprecated! insecure!) ',
            type: 'checkbox',
            value: allowedGrantTypes.includes('implicit')
          },
          {
            name: 'allowRefreshToken',
            title: 'Allow "refresh_token" grant_type',
            type: 'checkbox',
            value: allowedGrantTypes.includes('refresh_token')
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
            value: !!query.requirePkce
          },
        ],
      }
    ],
  };

}
