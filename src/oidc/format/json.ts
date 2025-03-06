import { getGlobalOrigin } from '@curveball/kernel';
import { resolve } from 'url';
import { PrincipalIdentity, User } from '../../types.ts';

type UserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name: string;
  website?: string;
  zoneinfo?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  locale?: string;
  updated_at: number;
  picture?: string;
  address?: string;
  birthdate?: string;
  created_at: number;
}


/**
 * This function converts a a12n-server User object, and returns an OIDC-formatted UserInfo object.
 */
export function toUserInfo(user: User, identities: PrincipalIdentity[]): UserInfo {

  let emailIdentity;
  let phoneIdentity;

  for(const identity of identities) {
    if (identity.uri.startsWith('mailto:')) {
      if (emailIdentity === null || identity.isPrimary) {
        emailIdentity = identity;
      }
    }
    if (identity.uri.startsWith('tel:')) {
      if (phoneIdentity === null || identity.isPrimary) {
        phoneIdentity = identity;
      }
    }
  }

  const origin = getGlobalOrigin();

  const result: UserInfo = {
    sub: resolve(origin, user.href),
    name: user.nickname,
    created_at: Math.floor(user.createdAt.getTime() / 1000 ),
    updated_at: Math.floor(user.modifiedAt.getTime() / 1000),
  };

  if (emailIdentity) {
    result.email = emailIdentity.uri.substring(7);
    result.email_verified = emailIdentity.verifiedAt !== null;
  }
  if (phoneIdentity) {
    result.phone_number = phoneIdentity.uri.substring(4);
    result.phone_number_verified = phoneIdentity.verifiedAt !== null;
  }

  return result;
}
