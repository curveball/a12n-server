import { render } from '../../templates';
type KeyValue = { [key: string]: string };

export function loginForm(msg: string, error: string, hiddenFields: KeyValue, registrationEnabled: boolean, totp: 'required' | 'optional' | 'disabled') {

  let totpRequired;
  let totpEnabled;

  switch (totp) {
    case 'required':
      totpRequired = true;
      totpEnabled = true;
      break;
    case 'optional':
      totpRequired = false;
      totpEnabled = true;
      break;
    case 'disabled':
      totpRequired = false;
      totpEnabled = false;
      break;
  }

  return render('login', {
    title: 'Login',
    msg: msg,
    error: error,
    hiddenFields: hiddenFields,
    registrationEnabled,
    action: '/authorize',
    totpRequired: totpRequired,
    totpEnabled: totpEnabled
  });

}
