import { Privilege, PrivilegeEntry } from '../types.ts';
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

  const groupedPrivileges: Record<string, string[]> = privileges.reduce((acc: Record<string, string[]>, privilege) => {
    if (!acc[privilege.principal.href]) {
      acc[privilege.principal.href] = [];
    }
    acc[privilege.principal.href].push(privilege.privilege);
    return acc;
  }, {});

  return {
    _links: {
      self: {
        href: `/privilege-search?resource=${encodeURIComponent(resource)}`,
        title: 'Privilege Search Results',
      },
      about: {
        href: resource,
      },
      principal: Object.keys(groupedPrivileges).map(principalHref => ({
        href: principalHref,
      })),
    },
    groupedPrivileges,
    privileges: privileges.map( privilege => ({
      principal: privilege.principal.href,
      privilege: privilege.privilege,
      resource: privilege.resource,
    })),

  };

}
