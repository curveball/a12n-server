import { render } from '../../templates';

export function registrationFrom(msg: string) {

  return render('register', {
    title: 'Register',
    msg: msg,
    action: '/register',
  });

}
