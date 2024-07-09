import { PrivilegeMap } from '../../privilege/types.js';
import { Group, App } from '../../types.js';
import { HalResource } from 'hal-types';

export function collection(apps: App[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': { href: '/app' },
      'item': apps.map( app => ({
        href: app.href,
        title: app.nickname,
      })),
      'create-form': { href: '/app/new', title: 'Add new App'},
    },
    total: apps.length,
  };

  return hal;

}

/**
 * Generate a HAL response for a specific app
 *
 * hasControl should only be true if the *current* user is same as the user
 * we're generating the repsonse for, or if the current authenticated user
 * has full admin privileges
 */
export function item(app: App, privileges: PrivilegeMap, isAdmin: boolean, groups: Group[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': {href: app.href, title: app.nickname },
      'me': { href: app.identity, title: app.nickname },
      'up' : { href: '/app', title: 'List of apps' },
      'group': groups.map( group => ({
        href: group.href,
        title: group.nickname,
      })),
      'client-collection': {
        href: `${app.href}/client`,
        title: 'List of OAuth2 client credentials'
      },
      'describedby': {
        href: 'https://curveballjs.org/schemas/a12nserver/app.json',
        type: 'application/schema+json',
      }
    },
    nickname: app.nickname,
    active: app.active,
    createdAt: app.createdAt,
    modifiedAt: app.modifiedAt,
    type: app.type,
    privileges
  };


  if (isAdmin) {
    hal._links['privileges'] = {
      href: `${app.href}/edit/privileges`,
      title: 'Change privilege policy',
    };
  }

  return hal;

}
