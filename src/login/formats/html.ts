import { render } from '../../templates';

export function loginForm(msg: string, error: string, registrationEnabled: boolean, totp: 'required' | 'optional' | 'disabled') {

  let totpRequired;
  let totpEnabled;

  switch (totp) {
    case "required":
      totpRequired = true;
      totpEnabled = true;
      break;
    case "optional":
      totpRequired = false;
      totpEnabled = true;
      break;
    case "disabled":
      totpRequired = false;
      totpEnabled = false;
      break;
  }

  return render('login', {
    title: 'Login',
    msg: msg,
    error: error,
    action: '/login',
    registrationEnabled,
    totpRequired,
    totpEnabled
  });

}