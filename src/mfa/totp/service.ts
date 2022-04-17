import { authenticator } from 'otplib';

import { insertAndGetId } from '../../database';

import { NewTotpDevice, TotpDevice } from './types';

type UserTotpDeviceRow = {
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

  await insertAndGetId('user_totp', newTotpDeviceRecord);

  return {
    'failures': 0,
    ...totpDevice,
  };
}
