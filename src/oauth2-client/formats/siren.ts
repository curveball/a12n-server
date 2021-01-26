import { User } from '../../user/types';

export function newClient(user: User) {

  const userHref = `/user/${user.id}`;

  return {
    properties: {
      title: 'Add new OAuth2 Client',
    },
    links: [
      { rel: ['up'], href: `${userHref}/client`, title: 'Back to list of clients'}
    ],
    actions: [
      {
        name: 'add-oauth2-client',
        title: 'Add new Client Credentials',
        method: 'POST',
        type: 'application/x-www-form-urlencoded',
        href: `${userHref}/client`,
        fields: [
          {
            name: 'clientId',
            title: 'Client ID, leave blank to auto-generate',
          },
          {
            name: 'allowAuthorizationCode',
            title: 'Allow "authorization_code" grant_type (for browser apps) ',
            type: 'checkbox',
          },
          {
            name: 'allowClientCredentials',
            title: 'Allow "client_credentials" grant_type (for server to server apps) ',
            type: 'checkbox',
          },
          {
            name: 'allowImplicit',
            title: 'Allow "implicit" grant_type (deprecated) ',
            type: 'checkbox',
          },
          {
            name: 'allowRefreshToken',
            title: 'Allow "refresh_token" grant_type',
            type: 'checkbox',
            value: true,
          },
          {
            name: 'redirectUris',
            title: 'Redirect Uris (1 per line)',
            type: 'textarea',
          },
        ],
      }
    ],
  };

}
