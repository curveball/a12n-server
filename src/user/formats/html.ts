import { render } from '../../templates';

export function createUserForm(msg: string, error: string) {

  return render('create-user', {
    title: 'Create User',
    msg: msg,
    error,
    action: '/user/new'
  });
}
