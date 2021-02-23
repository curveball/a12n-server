import { OneTimeToken } from './types';
import { User } from '../user/types';
import db from '../database';
import * as crypto from 'crypto';
import * as userService from '../user/service';
import { BadRequest } from '@curveball/http-errors';


/**
 * 2 hour token timeout
 */
const tokenTTL = 7200;

/**
 * This function will create a unique token then store it in the database
 */
export async function createToken(user: User): Promise<OneTimeToken> {
  const token = crypto.randomBytes(32).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const query = 'INSERT INTO reset_password_token SET user_id = ?, token = ?, expires_at = UNIX_TIMESTAMP() + ?, created_at = UNIX_TIMESTAMP()';

  await db.query(query, [
    user.id,
    token,
    tokenTTL
  ]);
  return {
    token,
    expires: new Date(Date.now() + tokenTTL*1000),
    ttl: tokenTTL,
  };
}
/**
 * Checks if a 'password reset token' is valid, and returns the associated user.
 * This function only works once for every token.
 * After calling this function, the token automatically gets deleted.
 */
export async function validateToken(token: string): Promise<User> {

  const query = 'SELECT token, user_id FROM reset_password_token WHERE token = ? AND expires_at > UNIX_TIMESTAMP()';
  const result = await db.query(query, [token]);

  if (result[0].length !== 1) {
    throw new BadRequest ('Failed to validate token');
  } else {
    await db.query('DELETE FROM reset_password_token WHERE token = ?', [token]);
    return userService.findById(result[0][0].user_id);
  }

}
