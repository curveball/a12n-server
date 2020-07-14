import { render } from '../../templates';

export function registrationForm(msg: string, error: string, mfaRegistrationEnabled: boolean): string {

  return render('register', {
    title: 'Register',
    msg: msg,
    error: error,
    action: '/register',
    mfaRegistrationEnabled,
  });

}

export function mfaRegistrationForm(msg: string, error: string): string {

  return render('register-webauthn', {
    title: 'MFA Register',
    msg: msg,
    error: error,
  });

}
