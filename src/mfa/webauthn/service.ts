import { NotFound } from '@curveball/http-errors';

import database from '../../database';
import { User } from '../../principal/types';

import { NewWebAuthnDevice, WebAuthnDevice } from './types';

type UserWebAuthnRow = {
  id: number;
  user_id: number;
  credential_id: string;
  public_key: string;
  counter: number;
};

export async function save(webAuthNDevice: NewWebAuthnDevice): Promise<WebAuthnDevice> {
  if (!isExistingDevice(webAuthNDevice)) {
    const query = 'INSERT INTO user_webauthn SET ?, created = UNIX_TIMESTAMP()';

    const newWebAuthnRecord: Partial<UserWebAuthnRow> = {
      user_id: webAuthNDevice.user.id,
      credential_id: webAuthNDevice.credentialID.toString('base64'),
      public_key: webAuthNDevice.publicKey.toString('base64'),
      counter: webAuthNDevice.counter
    };

    const result = await database.query(query, [newWebAuthnRecord]);

    return {
      id: result[0].insertId,
      ...webAuthNDevice
    };
  } else {
    const query = 'UPDATE user_webauthn SET ? WHERE id = ?';

    const updateWebAuthnRecord: Partial<UserWebAuthnRow> = {
      credential_id: webAuthNDevice.credentialID.toString('base64'),
      public_key: webAuthNDevice.publicKey.toString('base64'),
      counter: webAuthNDevice.counter
    };

    await database.query(query, [updateWebAuthnRecord, webAuthNDevice.id]);

    return webAuthNDevice;
  }
}

export async function findDevicesByUser(user: User): Promise<WebAuthnDevice[]> {
  const query = 'SELECT id, credential_id, public_key, counter FROM user_webauthn WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  return result[0].map( (row: UserWebAuthnRow) => recordToModel(row, user));
}

export async function findDeviceByUserAndId(user: User, credentialId: string): Promise<WebAuthnDevice> {
  const query = 'SELECT id, credential_id, public_key, counter FROM user_webauthn WHERE user_id = ? and credential_id = ?';
  const result = await database.query(query, [user.id, credentialId]);

  if (result[0].length !== 1) {
    throw new NotFound('Device with id: ' + credentialId + ' not found');
  }

  return recordToModel(result[0][0], user);
}

export async function hasWebauthn(user: User): Promise<boolean> {
  const query = 'SELECT credential_id FROM user_webauthn WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  return result[0].length !== 0;
}

export function recordToModel(userWebAuthn: UserWebAuthnRow, user: User): WebAuthnDevice {
  return {
    id: userWebAuthn.id,
    user: user,
    credentialID: Buffer.from(userWebAuthn.credential_id, 'base64'),
    publicKey: Buffer.from(userWebAuthn.public_key, 'base64'),
    counter: userWebAuthn.counter,
  };
}

function isExistingDevice(device: WebAuthnDevice | NewWebAuthnDevice): device is WebAuthnDevice {
  return (<WebAuthnDevice> device).id !== undefined;
}
