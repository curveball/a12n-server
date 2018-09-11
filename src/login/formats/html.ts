import { render } from '../../templates';

export function loginForm(msg: string) {

  return render('login', {
    title: 'Login',
    msg: msg,
    action: '/login',
  });

}
