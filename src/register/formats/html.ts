import { render } from '../../templates';

export function registrationForm(msg: string, error: string) {

  return render('register', {
    title: 'Register',
    msg: msg,
    error: error,
    action: '/register',
  });

}
