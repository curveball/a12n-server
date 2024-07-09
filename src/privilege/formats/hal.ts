import { Privilege, PrivilegeEntry } from '../types.js';
import { HalResource } from 'hal-types';

export function collection(privileges: Privilege[]): HalResource {

  return {
    _links: {
      self: { href: '/privilege' },
      item: privileges.map(privilege => ({
        href: '/privilege/' + privilege.privilege,
        title: privilege.description
      })),
      'search-resource-privileges': {
        href: '/privilege-search{?resource}',
        title: 'Search privileges by resource',
        templated: true,
      }
    },
    total: privileges.length,
  };

}

export function item(privilege: Privilege): HalResource {
  return {
    _links: {
      self: {
        href: '/privilege/' + privilege.privilege
      },
      collection: {
        href: '/privilege',
        title: 'Privilege Collection'
      }
    },
    privilege: privilege.privilege,
    description: privilege.description
  };
}

export function search(resource: string, privileges: PrivilegeEntry[]): HalResource {

  return {
    _links: {
      self: {
        href: `/privilege-search?resource=${encodeURIComponent(resource)}`,
        title: 'Privilege Search Results',
      },
      about: {
        href: resource,
      },
    },
    privileges: privileges.map( privilege => ({
      principal: privilege.principal.href,
      privilege: privilege.privilege,
      resource: privilege.resource,
    })),

  };

}
