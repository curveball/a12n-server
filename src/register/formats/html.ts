import { render } from '../../templates';

export function registrationForm(msg: string) {

  return render('register', {
    title: 'Register',
    msg: msg,
    action: '/register',
  });

}
