import { NotFound } from '@curveball/http-errors';

import db, { query, insertAndGetId } from '../../database';
import { User } from '../../principal/types';
import { NewWebAuthnDevice, WebAuthnDevice } from './types';
import { UserWebauthnRecord } from 'knex/types/tables';


export async function save(webAuthNDevice: NewWebAuthnDevice): Promise<WebAuthnDevice> {
  if (!isExistingDevice(webAuthNDevice)) {
    const newWebAuthnRecord: Partial<UserWebauthnRecord> = {
      user_id: webAuthNDevice.user.id,
      credential_id: webAuthNDevice.credentialID.toString('base64'),
      public_key: webAuthNDevice.publicKey.toString('base64'),
      counter: webAuthNDevice.counter,
      created: Math.floor(Date.now() / 1000),
    };

    const result = await insertAndGetId('user_webauthn', newWebAuthnRecord);

    return {
      id: result,
      ...webAuthNDevice
    };
  } else {
    const updateWebAuthnRecord: Partial<UserWebauthnRecord> = {
      credential_id: webAuthNDevice.credentialID.toString('base64'),
      public_key: webAuthNDevice.publicKey.toString('base64'),
      counter: webAuthNDevice.counter
    };

    await db('user_webauthn')
      .where('id', webAuthNDevice.id)
      .update(updateWebAuthnRecord);

    return webAuthNDevice;
  }
}

export async function findDevicesByUser(user: User): Promise<WebAuthnDevice[]> {
  const result = await query(
    'SELECT id, credential_id, public_key, counter FROM user_webauthn WHERE user_id = ?',
    [user.id]
  );

  return result.map( (row: UserWebauthnRecord) => recordToModel(row, user));
}

export async function findDeviceByUserAndId(user: User, credentialId: string): Promise<WebAuthnDevice> {
  const result = await query(
    'SELECT id, credential_id, public_key, counter FROM user_webauthn WHERE user_id = ? and credential_id = ?',
    [user.id, credentialId]
  );

  if (result.length !== 1) {
    throw new NotFound('Device with id: ' + credentialId + ' not found');
  }

  return recordToModel(result[0], user);
}

export async function hasWebauthn(user: User): Promise<boolean> {
  const result = await query(
    'SELECT credential_id FROM user_webauthn WHERE user_id = ?',
    [user.id]
  );

  return result.length !== 0;
}

export function recordToModel(userWebAuthn: UserWebauthnRecord, user: User): WebAuthnDevice {
  return {
    id: userWebAuthn.id,
    user: user,
    credentialID: Buffer.from(userWebAuthn.credential_id, 'base64'),
    publicKey: Buffer.from(userWebAuthn.public_key, 'base64'),
    counter: userWebAuthn.counter,
  };
}

function isExistingDevice(device: WebAuthnDevice | NewWebAuthnDevice): device is WebAuthnDevice {
  return (device as WebAuthnDevice).id !== undefined;
}
