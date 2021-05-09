import { User } from '../principal/types';

export type MFALoginSession = {
  user: User;
  mfaType: 'totp'|'webauthn';
}
