import { OneTimeToken } from './types.ts';
import { PrincipalIdentity, User } from '../types.ts';
import db from '../database.ts';
import { PrincipalService } from '../principal/service.ts';
import { BadRequest } from '@curveball/http-errors';
import { generateSecretToken } from '../crypto.ts';
import * as principalIdentityService from '../principal-identity/service.ts';

/**
 * 2 hour token timeout
 */
const defaultTokenTTL = 7200;

/**
 * This function will create a unique token then store it in the database
 */
export async function createToken(user: User, expiresIn: number | null, identity: PrincipalIdentity|null): Promise<OneTimeToken> {
  const token = await generateSecretToken();
  if (expiresIn==null) expiresIn = defaultTokenTTL;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  await db('verification_token').insert({
    principal_id: user.id,
    token,
    expires_at: expiresAt,
    created_at: Math.floor(Date.now() / 1000),
    principal_identity_id: identity?.id,
  });

  return {
    token,
    expires: new Date(expiresAt*1000),
    ttl: expiresIn
  };
}

/**
 * Checks if a 'password reset token' is valid, and returns the associated user.
 * This function only works once for every token.
 * After calling this function, the token automatically gets deleted.
 */
export async function validateToken(token: string, dontExpire: boolean = false): Promise<[User, PrincipalIdentity|null]> {

  const result = await db('verification_token')
    .select()
    .where({token})
    .andWhere('expires_at', '>', Math.floor(Date.now() / 1000))
    .first();

  if (!result) {
    throw new BadRequest('Failed to validate token');
  } else {
    if (!dontExpire) {
      await db('verification_token').delete().where({token});
    }
    const principalService = new PrincipalService('insecure');
    const principal = await principalService.findById(result.principal_id, 'user');
    if (result.principal_identity_id) {
      return [
        principal,
        await principalIdentityService.findById(principal, result.principal_identity_id)
      ];
    } else {
      return [
        principal,
        null
      ];
    }
  }

}
