import { User } from '../types.js';
import { UserAuthFactor } from './types.js';

import * as services from '../services.js';

export async function findForUser(principal: User): Promise<UserAuthFactor[]> {

  const result:UserAuthFactor[] = [];
  if (await services.user.hasPassword(principal)) {
    result.push({
      href: `${principal.href}/auth-factor/pw`,
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

  return result;

}
