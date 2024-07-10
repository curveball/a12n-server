import { User } from '../types.js';

export type MFALoginSession = {
  user: User;
  mfaType: 'totp'|'webauthn';
}
