import { render } from '../../templates';

export function loginForm(msg: string, registrationEnabled: boolean) {

  return render('login', {
    title: 'Login',
    msg: msg,
    action: '/login',
    registrationEnabled
  });

}
