import { render } from '../../templates.js';
type KeyValue = { [key: string]: string };

export function loginForm(msg: string, error: string, hiddenFields: KeyValue, registrationEnabled: boolean, registrationUri: string, resetPasswordUri: string): string {
  return render('login', {
    title: 'Login',
    msg: msg,
    error: error,
    hiddenFields: hiddenFields,
    action: '/login',
    registrationEnabled,
    registrationUri,
    resetPasswordUri,
  });

}

export function mfaForm(
  msg: string,
  error: string,
  useTotp: boolean,
  useWebAuthn: boolean,
  hiddenFields: KeyValue,
): string {
  return render('login-mfa', {
    title: 'MFA',
    msg: msg,
    error: error,
    useTotp,
    useWebAuthn,
    hiddenFields: hiddenFields,
    action: '/login/mfa',
  });

}
