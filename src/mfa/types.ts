import { User } from '../user/types'

export type MFALoginSession = {
  user: User;
  mfaType: 'totp'|'webauthn'
}
