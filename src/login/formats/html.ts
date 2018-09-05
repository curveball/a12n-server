import { render } from '../../templates';

export function loginForm() {

  return render('login', {
    title: 'Login',
  });

}
