import { PrivilegeMap } from '../../privilege/types.ts';
import { Group, App, PrincipalIdentity } from '../../types.ts';
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
export function item(app: App, privileges: PrivilegeMap, isAdmin: boolean, groups: Group[], identities: PrincipalIdentity[]): HalResource {

  return {
    _links: {
      'self': {href: app.href, title: app.nickname },
      'up' : { href: '/app', title: 'List of apps' },
      'me': identities.map( identity => {
        if (identity.label) {
          return {
            href: identity.uri,
            title: identity.label,
          };
        } else {
          return {
            href: identity.uri,
          };
        }
      }),
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
      },
      ...isAdmin && {
        privileges: {
          href: `${app.href}/edit/privileges`,
          title: 'Change privilege policy',
        }
      }
    },
    nickname: app.nickname,
    active: app.active,
    createdAt: app.createdAt,
    modifiedAt: app.modifiedAt,
    type: app.type,
    privileges
  };

}
