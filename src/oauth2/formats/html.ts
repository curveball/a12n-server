import { render } from '../../templates';
type KeyValue = { [key: string]: string };

export function loginForm(msg: string, hiddenFields: KeyValue) {

  return render('login', {
    title: 'Login',
    msg: msg,
    hiddenFields: hiddenFields,
    action: '/authorize',
  });

}
