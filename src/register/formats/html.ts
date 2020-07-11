import { render } from '../../templates';

export function registrationForm(msg: string, error: string, mfaRegistrationEnabled: boolean) {

  return render('register', {
    title: 'Register',
    msg: msg,
    error: error,
    action: '/register',
    mfaRegistrationEnabled,
  });

}
export function mfaRegistrationForm(msg: string, error: string) {

  return render('register-webauthn', {
    title: 'MFA Register',
    msg: msg,
    error: error,
    action: '/register-webauthn'
  });

}
