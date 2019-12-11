import { render } from '../../templates';
type KeyValue = { [key: string]: string };

export function loginForm(msg: string, error: string, hiddenFields: KeyValue, registrationEnabled: boolean) {

  return render('login', {
    title: 'Login',
    msg: msg,
    error: error,
    hiddenFields: hiddenFields,
    action: '/authorize',
  });

}
