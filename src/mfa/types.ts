import { User } from '../types';

export type MFALoginSession = {
  user: User;
  mfaType: 'totp'|'webauthn';
}
