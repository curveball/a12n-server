import { App } from '../../principal/types';
import { OAuth2Client } from '../types';
import { HalResource } from 'hal-types';

export function collection(user: App, clients: OAuth2Client[]): HalResource {

  return {
    _links: {
      self: { href: `${user.href}/client` },
      up: { href: user.href, title: user.nickname},
      item: clients.map( client => ({
        href: `${user.href}/client/${client.clientId}`
      })),
      'create-form': {
        href: `${user.href}/client/new`,
        title: 'Add new OAuth2 credentials',
        type: 'application/vnd.siren+json',
      },
    },
    total: clients.length,

    /*
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
    },*/

  };

}
export function item(client: OAuth2Client, redirectUris: string[]): HalResource {

  return {
    _links: {
      self: { href: `${client.app.href}/client/${client.clientId}` },
      collection: { href: `${client.app.href}/client`, title: 'List of OAuth2 clients'},
    },
    clientId: client.clientId,
    allowedGrantTypes: client.allowedGrantTypes,
    redirectUris,
    requirePkce: client.requirePkce,
  };

}

export function newClientSuccess(client: OAuth2Client, redirectUris: string[] ,secret: string): HalResource {

  return {
    _links: {
      self: { href: `${client.app.href}/client/${client.clientId}` },
      collection: { href: `${client.app.href}/client`, title: 'List of OAuth2 clients'},
    },
    clientId: client.clientId,
    clientSecret: secret,
    allowedGrantTypes: client.allowedGrantTypes,
    redirectUris,
  };

}
