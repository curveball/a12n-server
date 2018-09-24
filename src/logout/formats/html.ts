import { render } from '../../templates';

export function logoutForm(msg: string) {

  return render('logout', {
    title: 'Logout',
    msg: msg,
    action: '/logout',
  });

}
