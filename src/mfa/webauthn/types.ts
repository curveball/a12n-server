import type { Base64URLString } from '@simplewebauthn/server';
import { User } from '../../types.ts';

export type WebAuthnDevice = {
    id: number;
    user: User;
    credentialID: Base64URLString;
    publicKey: Uint8Array<ArrayBuffer>;
    counter: number;
}

export type NewWebAuthnDevice = Omit<WebAuthnDevice, 'id'>;
