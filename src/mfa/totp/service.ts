import { authenticator } from 'otplib';

import { UserTotpRecord } from 'knex/types/tables.js';
import { Conflict } from '@curveball/http-errors';
import * as QRCode from 'qrcode';

import { getSetting } from '../../server-settings.js';
import db from '../../database.js';
import { NewTotpDevice, TotpDevice } from './types.js';
import { User } from '../../types.js';

const MAX_FAILURES = 10;

export function generateSecret(): string {
  const secret = authenticator.generateSecret();
  return secret;
}

export async function save(totpDevice: NewTotpDevice): Promise<TotpDevice> {
  const newTotpDeviceRecord: Partial<UserTotpRecord> = {
    user_id: totpDevice.user.id,
    secret: totpDevice.secret,
    created: Math.floor(Date.now() / 1000),
  };

  if (await hasTotp(totpDevice.user)) {
    throw new Conflict('TOTP was already set up for this user.');
  }

  await db('user_totp').insert(newTotpDeviceRecord);

  return {
    'failures': 0,
    ...totpDevice,
  };
}

/**
 * Returns true or false if the totp was provided or not.
 *
 *
 */
export async function hasTotp(user: User): Promise<boolean> {

  const result = await db('user_totp')
    .select('secret')
    .where('user_id', user.id);

  return result.length !== 0;

}

/**
 * Returns a data: uri with a QR code for a user.
 */
export function generateTotpQrcode(principal: User, secret: string): Promise<string> {

  const otpauth = authenticator.keyuri(
    principal.nickname,
    getSetting('totp.serviceName'),
    secret
  );

  return QRCode.toDataURL(otpauth);
}


/**
 * Returns true or false if the totp token was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validateTotp(user: User, token: string): Promise<boolean> {

  const result = await db('user_totp')
    .select(['user_id', 'secret', 'failures'])
    .where('user_id', user.id)
    .first();

  if (!result) {
    // Not set up
    throw new Error('TOTP is not set up for this user');
  }

  if (result.failures >= MAX_FAILURES) {
    throw new Error('Too many failed attempts. Contact administrator if this is in error');
  }

  const secret = result.secret;

  const checkResult = authenticator.check(token, secret);
  if (checkResult) {
    if (result.failures > 0) {
      // Reset fail count
      await db('user_totp')
        .update({
          failures: 0
        })
        .where({
          user_id: result.user_id
        });
    }
    return true;
  } else {

    await db('user_totp')
      .update({
        failures: db.raw('failures + 1')
      })
      .where({
        user_id: result.user_id
      });
    return false;

  }

}
