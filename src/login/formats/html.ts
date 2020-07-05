import { render } from '../../templates';

export function loginForm(msg: string, error: string, registrationEnabled: boolean) {

  return render('login', {
    title: 'Login',
    msg: msg,
    error: error,
    action: '/login',
    registrationEnabled,
  });

}
