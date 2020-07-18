import { authenticator } from 'otplib';

import database from '../../database';

import { NewTotpDevice, TotpDevice } from './types';

type UserTotpDeviceRow = {
  id: number;
  user_id: number;
  secret: string;
};

export function generateSecret(): string {
  const secret = authenticator.generateSecret();

  return secret;
}

export async function save(totpDevice: NewTotpDevice): Promise<TotpDevice> {
  const query = 'INSERT INTO user_totp SET ?, created = UNIX_TIMESTAMP()';

  const newTotpDeviceRecord: Partial<UserTotpDeviceRow> = {
    user_id: totpDevice.user.id,
    secret: totpDevice.secret,
  };

  const result = await database.query(query, [newTotpDeviceRecord]);

  return {
    id: result[0].insertId,
    'failures': 0,
    ...totpDevice,
  };
}