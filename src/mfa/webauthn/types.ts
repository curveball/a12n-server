import { User } from '../../user/types';

export type WebAuthnDevice = {
    id: number,
    user: User,
    credentialID: string,
    publicKey: string,
    counter: number
}

export type NewWebAuthnDevice = Omit<WebAuthnDevice, 'id'>;
