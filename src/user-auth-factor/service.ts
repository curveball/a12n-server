import { User } from '../types.ts';
import { UserAuthFactor } from './types.ts';

import * as services from '../services.ts';

export async function findForUser(principal: User): Promise<UserAuthFactor[]> {

  const result:UserAuthFactor[] = [];
  if (await services.user.hasPassword(principal)) {
    result.push({
      href: `${principal.href}/password`,
      title: 'Password',
      type: 'password',
    });
  }
  if (await services.mfaTotp.hasTotp(principal)) {
    result.push({
      href: `${principal.href}/auth/factor/totp`,
      title: 'TOTP',
      type: 'totp',
    });
  }

  const identities = await services.principalIdentity.findByPrincipal(principal);

  for(const identity of identities) {
    if (!identity.isMfa) {
      continue;
    }
    if (identity.uri.startsWith('mailto:')) {
      /**
       * We're only supporting email right now, but more will follow
       */
      result.push({
        href: identity.href,
        type: 'email-otp',
        title: identity.label ?? 'Email verification',
      });
    }
  }


  return result;

}

