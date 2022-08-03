import { App } from '../../principal/types';
import { OAuth2Client } from '../types';
import { HalResource } from 'hal-types';

export function collection(app: App, clients: OAuth2Client[]): HalResource {

  return {
    _links: {
      self: { href: `${app.href}/client` },
      up: { href: app.href, title: app.nickname},
      item: clients.map( client => ({
        href: `${app.href}/client/${client.clientId}`
      })),
      'create-form': {
        href: `${app.href}/client/new?allowGrantTypes=refresh_token`,
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
      self: { href: client.href },
      collection: { href: `${client.app.href}/client`, title: 'List of OAuth2 clients'},
      'edit-form': {
        href: `${client.href}/edit`,
        title: 'Edit',
      },
    },
    clientId: client.clientId,
    allowedGrantTypes: client.allowedGrantTypes,
    redirectUris,
    requirePkce: client.requirePkce,
  };

}
export function editForm(client: OAuth2Client, redirectUris: string[]): HalResource {

  return {
    _links: {
      self: {
        href: `${client.href}/edit`,
        title: 'Edit OAuth2 Client',
      },
      up: {
        href: client.href,
        title: 'Back to client',
      }
    },
    _templates: {
      edit: {
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        properties: [
          {
            name: 'clientId',
            readOnly: true,
            value: client.clientId,
          },
          {
            name: 'allowAuthorizationCode',
            prompt: 'Allow "authorization_code" grant_type (for browser apps) ',
            type: 'checkbox',
            value: client.allowedGrantTypes.includes('authorization_code') ? 'true' : '',
          },
          {
            name: 'allowClientCredentials',
            prompt: 'Allow "client_credentials" grant_type (for server to server apps) ',
            type: 'checkbox',
            value: client.allowedGrantTypes.includes('client_credentials') ? 'true' : '',
          },
          {
            name: 'allowPassword',
            prompt: 'Allow "password" grant_type (trusted applications only)',
            type: 'checkbox',
            value: client.allowedGrantTypes.includes('password') ? 'true' : '',
          },
          {
            name: 'allowImplicit',
            prompt: 'Allow "implicit" grant_type (deprecated) ',
            type: 'checkbox',
            value: client.allowedGrantTypes.includes('implicit') ? 'true' : '',
          },
          {
            name: 'allowRefreshToken',
            prompt: 'Allow "refresh_token" grant_type',
            type: 'checkbox',
            value: client.allowedGrantTypes.includes('refresh_token') ? 'true' : '',
          },
          {
            name: 'redirectUris',
            prompt: 'Redirect Uris (1 per line)',
            type: 'textarea',
            value: redirectUris.join('\n'),
          },
          {
            name: 'requirePkce',
            prompt: 'Require PKCE support (modern clients support this, but not everyone does)',
            type: 'checkbox',
            value: client.requirePkce ? 'true' : '',
          },
        ],
      }
    }
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
    requirePkce: client.requirePkce
  };

}
