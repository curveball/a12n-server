import { HalResource } from 'hal-types';
import { User } from '../../types.ts';
import { OneTimeToken } from '../types.ts';

export function oneTimeToken(user: User, url: string, token: OneTimeToken): HalResource {

  return {
    _links: {
      self: {
        href: `/user/${user.id}/one-time-token`,
      },
      'reset-password': {
        href: url,
        title: 'Reset password page',
      },
      user: {
        href: `/user/${user.id}`,
        title: user.nickname
      },
    },
    ...token,
  };
}
