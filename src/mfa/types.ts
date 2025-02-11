import { User } from '../types.ts';

export type MFALoginSession = {
  user: User;
  mfaType: 'totp'|'webauthn';
}
