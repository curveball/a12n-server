import { User } from '../../types';

export type WebAuthnDevice = {
    id: number;
    user: User;
    credentialID: Buffer;
    publicKey: Buffer;
    counter: number;
}

export type NewWebAuthnDevice = Omit<WebAuthnDevice, 'id'>;
