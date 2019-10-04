import { render } from '../../templates';

export function changePasswordForm(msg: string) {

  return render('changepassword', {
    title: 'Change Password',
    msg: msg,
    action: '/changepassword',
  });

}
