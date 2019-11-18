import { render } from '../../templates';

export function logoutForm(msg: string, error: string) {

  return render('logout', {
    title: 'Logout',
    msg: msg,
    error: error,
    action: '/logout',
  });

}
