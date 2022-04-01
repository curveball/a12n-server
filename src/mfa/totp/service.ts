import { authenticator } from 'otplib';

import database from '../../database';

import { NewTotpDevice, TotpDevice } from './types';

type UserTotpDeviceRow = {
  id: number;
  user_id: number;
  secret: string;
  created: number;
};

export function generateSecret(): string {
  const secret = authenticator.generateSecret();

  return secret;
}

export async function save(totpDevice: NewTotpDevice): Promise<TotpDevice> {
  const newTotpDeviceRecord: Partial<UserTotpDeviceRow> = {
    user_id: totpDevice.user.id,
    secret: totpDevice.secret,
    created: Math.floor(Date.now() / 1000),
  };

  const connection = await database.getConnection();

  const result = await connection<UserTotpDeviceRow>('user_totp')
    .insert(newTotpDeviceRecord, 'id')
    .returning('id');

  return {
    id: result[0],
    'failures': 0,
    ...totpDevice,
  };
}
