import { Principal, PrincipalIdentity } from '../../types.js';
import { HalResource } from 'hal-types';
import { PrincipalIdentity as HalPrincipalIdentity } from '../../api-types.js';
import { HttpError } from '@curveball/http-errors';

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
      },
      'verify-response': {
        method: 'POST',
        title: 'Submit verification code',
        target: `${identity.href}/verify-response`,
        properties: [
          {
            name: 'code',
            type: 'text',
            prompt: 'Code',
            regex: '^[0-9]{6}$'
          }
        ],
      }
    };
    if (identity.verifiedAt) {
      res._templates['set-mfa'] = {
        method: 'PATCH',
        title: identity.isMfa ? 'Disable for MFA' : 'Enable for MFA',
        target: `${identity.href}`,
        properties: [
          {
            name: 'isMfa',
            type: 'hidden',
            value: identity.isMfa ? '0' : '1',
          }
        ]
      };
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
    _templates: {
      'verify-response': {
        method: 'POST',
        title: 'Enter verification code',
        target: `${identity.href}/verify-response`,
        properties: [
          {
            name: 'code',
            prompt: 'Verification code',
            type: 'text',
            minLength: 6,
            maxLength: 6,
            required: true,
            regex: '^[0-9]{6}$',
          }
        ]
      }
    },
  };

}

export function verifySuccess(identity: PrincipalIdentity): HalResource {

  return {
    _links: {
      self: {
        href: `${identity.href}/verify-success`,
      },
      up: {
        href: identity.href,
        title: 'Back to identity resource',
      }
    },
    title: 'Verification successful!'
  };

}

export function verifyFail(identity: PrincipalIdentity, err: HttpError): HalResource {

  return {
    _links: {
      self: {
        href: `${identity.href}/verify-success`,
      },
      up: {
        href: identity.href,
        title: 'Back to identity resource',
      }
    },
    title: 'Verification failed',
    description: err.message,
    _templates: {
      'resend-verify': {
        title: 'Send a new verification code',
        method: 'POST',
        target: `${identity.href}/verify`
      }
    }
  };

}
