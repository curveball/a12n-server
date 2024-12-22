import { render } from '../../../templates.js';

export function registrationForm(msg: string, error: string): string {

  return render('register/webauthn', {
    title: 'Register MFA Device',
    msg: msg,
    error: error,
  }, 'minimal-form');

}
