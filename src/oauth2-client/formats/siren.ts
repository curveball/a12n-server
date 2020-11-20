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
            name: 'allowedGrantTypes',
            title: 'Allowed Grant Types (space separated)',
          },
          {
            name: 'redirectUris',
            title: 'Redirect Uris (space separated)',
          },
        ],
      }
    ],
  };

}
