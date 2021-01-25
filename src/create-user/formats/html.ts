import { render } from '../../templates';
import { UserTypeList } from '../../user/types';

export function createUserForm(msg: string, error: string) {

  return render('create-user', {
    title: 'Create User',
    msg: msg,
    error,
    type: UserTypeList,
    action: '/create-user'
  });
}
