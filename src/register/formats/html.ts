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

export function mfaRegistrationForm(msg: string, error: string, totpEnabled: boolean, webAuthnEnabled: boolean): string {

  return render('register-mfa', {
    title: 'MFA Register',
    msg: msg,
    error: error,
    action: '/register/mfa',
    totpEnabled,
    webAuthnEnabled,
  });

}
