import { render } from '../../../templates.js';

export function registrationForm(msg: string, error: string, secret: string, qrCode: string): string {

  return render('register/totp', {
    title: 'Register MFA Device',
    action: '/register/mfa/totp',
    msg: msg,
    error: error,
    secret,
    qrCode,
  });

}
