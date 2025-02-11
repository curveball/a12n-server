import { UserAppPermission } from '../types.ts';
import { HalResource } from 'hal-types';
import { User } from '../../types.ts';


export function collection(user: User, userAppPermissions: UserAppPermission[]): HalResource {

  return {
    _links: {
      self: {
        href: `${user.href}/app-permissions`,
        title: 'App Permissions',
      },
      principal: {
        href: user.href,
        title: user.nickname,
      },
      item: userAppPermissions.map( item => {
        return {
          title: item.app.nickname,
          href: `${user.href}/app-permission/${item.app.externalId}`
        };
      })
    },
    description: 'This collection contains the list of applications that can act on behalf of this user',
    total: userAppPermissions.length,

  };

}

export function item(userAppPermissions: UserAppPermission): HalResource {

  const user = userAppPermissions.user;
  const app = userAppPermissions.app;

  return {
    _links: {
      self: {
        href: `${user.href}/app-permissions/${app.externalId}`,
        title: `${app.nickname} permissions for ${user.nickname}`,
      },
      user: {
        href: user.href,
        title: user.nickname,
      },
      app: {
        href: app.href,
        title: app.nickname,
      },
      collection: {
        href: `${user.href}/app-permission`,
        title: 'List of apps for this user'
      },
      describedby: {
        href: 'https://curveballjs.org/schemas/a12nserver/user-app-permissions.json',
        type: 'application/schema+json'
      },
    },
    scope: userAppPermissions.scope,
    createdAt: userAppPermissions.createdAt.toISOString(),
    modifiedAt: userAppPermissions.modifiedAt.toISOString(),
    lastUsedAt: userAppPermissions.lastUsedAt?.toISOString() ?? null,

  };

}
