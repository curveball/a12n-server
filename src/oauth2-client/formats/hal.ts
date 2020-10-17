import { User } from '../../user/types';
import { OAuth2Client } from '../types';
import { HalResource } from 'hal-types';

export function collection(user: User, clients: OAuth2Client[]): HalResource {

  return {
    _links: {
      self: { href: `/user/${user.id}/client` },
      up: { href: `/user/${user.id}`, title: user.nickname},
      item: clients.map( client => ({
        href: `/user/${user.id}/client/${client.clientId}`
      })),
    },
    total: clients.length,

    _templates: {
      default: {
        title: 'Add new client',
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        properties: [
          {
            name: 'clientId',
          },
          {
            name: 'allowedGrantTypes',
            prompt: 'Allowed grant types (space separated)',
            required: true,
          },
          {
            name: 'redirectUris',
            prompt: 'Redirect uris (space separated)',
          },
        ],
      }
    },

  };

}
export function item(client: OAuth2Client, redirectUris: string[]): HalResource {

  return {
    _links: {
      self: { href: `/user/${client.user.id}/client/${client.clientId}` },
      collection: { href: `/user/${client.user.id}/client`, title: 'List of OAuth2 clients'},
    },
    clientId: client.clientId,
    allowedGrantTypes: client.allowedGrantTypes,
    redirectUris,

  };

}
