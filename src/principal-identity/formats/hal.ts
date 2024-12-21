import { Principal, PrincipalIdentity } from '../../types.js';
import { HalResource } from 'hal-types';
import { PrincipalIdentity as HalPrincipalIdentity } from '../../api-types.js';

export function collection(principal: Principal, identities: PrincipalIdentity[]): HalResource {

  return {
    _links: {
      self: {
        href: `${principal.href}/identity`,
        title: 'Identities associated with a principal',
      },
      up: {
        href: principal.href,
        title: 'Back to principal',
      },
      principal: {
        href: principal.href,
        title: principal.nickname,
      },
      item: identities.map( identity => {
        return {
          href: identity.href,
          title: identity.uri,
        };
      }),
    },
    total: identities.length

  };

}

export function item(principal: Principal, identity: PrincipalIdentity): HalResource<HalPrincipalIdentity> {

  const res: HalResource<HalPrincipalIdentity> = {
    _links: {
      self: {
        href: identity.href,
        title: identity.label ?? undefined,
      },
      principal: {
        href: principal.href,
        title: principal.nickname,
      },
      collection: {
        href: `${principal.href}/identity`,
        title: 'Back to collection',
      },
      about: {
        href: identity.uri,
      },
      'describedby': {
        href: 'https://curveballjs.org/schemas/a12nserver/principal-identity.json',
        type: 'application/schema+json'
      }
    },
    label: identity.label ?? undefined,
    isPrimary: identity.isPrimary,
    isMfa: identity.isMfa,
    verifiedAt: identity.verifiedAt?.toISOString() ?? null,
    createdAt: identity.createdAt.toISOString(),
    modifiedAt: identity.modifiedAt.toISOString(),
  };

  if (identity.uri.startsWith('mailto:')) {
    res._templates = {
      verify: {
        method: 'POST',
        title: identity.verifiedAt ? 'Re-verify' : 'Verify',
        target: `${identity.href}/verify`,
      }
    };
  }

  return res;

}

export function verifyResponseForm(identity: PrincipalIdentity): HalResource {

  return {
    _links: {
      self: {
        href: `${identity.href}/verify`,
      }
    },
    todo: 'Work in progress',
  };

}
