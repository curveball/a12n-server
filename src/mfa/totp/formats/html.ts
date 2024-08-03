import { render } from '../../../templates.js';


type RegisterFormParams = {
  message: string,
  error: string,
  secret: string,
  qrCode: string,
  title?: string,
  action: string,
  csrfToken: string;
};


export function registrationForm(params: RegisterFormParams): string {

  return render('register/totp', {
    title: params.title ?? 'Register TOTP Device',
    action: params.action, // '/register/mfa/totp',
    msg: params.message,
    error: params.error,
    secret: params.secret,
    qrCode: params.qrCode,
    'csrf-token': params.csrfToken,
  });

}
