import { render } from '../../templates';

export function registrationForm(msg: string, error: string, mfaRegistrationEnabled: boolean, firstRunMode: boolean, continueUrl?: string): string {

  const hiddenFields: Record<string,string> = {};
  if (continueUrl) {
    hiddenFields.continue = continueUrl;
  }

  return render('register/user', {
    title: firstRunMode ? 'Create Admin Account' : 'Register',
    msg: msg,
    error: error,
    action: '/register',
    mfaRegistrationEnabled,
    hiddenFields,
  });

}

export function mfaRegistrationForm(msg: string, error: string, totpEnabled: boolean, webAuthnEnabled: boolean): string {

  return render('register/mfa', {
    title: 'Register MFA Device',
    msg: msg,
    error: error,
    action: '/register/mfa',
    totpEnabled,
    webAuthnEnabled,
  });

}
