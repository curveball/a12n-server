import { render } from '../../templates.ts';

export function changePasswordForm(msg: string, error: string, csrfToken: string) {

  return render('changepassword', {
    title: 'Change Password',
    msg: msg,
    error: error,
    action: '/change-password',
    csrfToken: csrfToken,
  }, 'minimal-form');

}
