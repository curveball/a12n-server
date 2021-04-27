import { HalResource } from 'hal-types';
import { User } from '../../principal/types';
import { OneTimeToken } from '../types';

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
