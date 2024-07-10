import { OneTimeToken } from './types.js';
import { User } from '../types.js';
import db from '../database.js';
import { PrincipalService } from '../principal/service.js';
import { BadRequest } from '@curveball/http-errors';
import { generateSecretToken } from '../crypto.js';

/**
 * 2 hour token timeout
 */
const tokenTTL = 7200;

/**
 * This function will create a unique token then store it in the database
 */
export async function createToken(user: User, expiresIn: number | null): Promise<OneTimeToken> {
  const token = await generateSecretToken();
  const expiresAt = Math.floor(Date.now() / 1000) + (expiresIn ?? tokenTTL);

  await db('reset_password_token').insert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
    created_at: Math.floor(Date.now() / 1000)
  });

  return {
    token,
    expires: new Date(expiresAt*1000),
    ttl: tokenTTL,
  };
}
/**
 * Checks if a 'password reset token' is valid, and returns the associated user.
 * This function only works once for every token.
 * After calling this function, the token automatically gets deleted.
 */
export async function validateToken(token: string, dontExpire: boolean = false): Promise<User> {

  const result = await db('reset_password_token')
    .select()
    .where({token})
    .andWhere('expires_at', '>', Math.floor(Date.now() / 1000))
    .first();

  if (!result) {
    throw new BadRequest('Failed to validate token');
  } else {
    if (!dontExpire) {
      await db('reset_password_token').delete().where({token});
    }
    const principalService = new PrincipalService('insecure');
    return principalService.findById(result.user_id, 'user');
  }

}
