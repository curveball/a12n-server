import database from '../../database';
import { User } from '../../user/types'

import { NewWebAuthnDevice, WebAuthnDevice } from './types';

type UserWebAuthnRow = {
    id: number;
    user_id: number;
    credential_id: string;
    public_key: string,
    counter: number
  };

export async function save(webAuthNDevice: NewWebAuthnDevice): Promise<WebAuthnDevice> {
    // New user
    const query = 'INSERT INTO user_webauthn SET ?, created = UNIX_TIMESTAMP()';

    const newUserRecord: Partial<UserWebAuthnRow> = {
        user_id: webAuthNDevice.user.id,
        credential_id: webAuthNDevice.credentialId,
        public_key: webAuthNDevice.publicKey,
        counter: webAuthNDevice.counter
    };

    const result = await database.query(query, [newUserRecord]);

    return {
        id: result[0].insertId,
        ...webAuthNDevice
    };
}

export async function findWebAuthnDevicesByUser(user: User): Promise<WebAuthnDevice[]> {
    const query = 'SELECT id, credential_id, public_key, counter FROM user_webauthn WHERE user_id = ?';
    const result = await database.query(query, [user.id]);

    return result[0].map( (row: UserWebAuthnRow) => recordToModel(row, user));
}

export function recordToModel(userWebAuthn: UserWebAuthnRow, user: User): WebAuthnDevice {
    return {
        id: userWebAuthn.id,
        user: user,
        credentialId: userWebAuthn.credential_id,
        publicKey: userWebAuthn.public_key,
        counter: userWebAuthn.counter,
    }
}
