import { render } from '../../templates';

export function resetPasswordRedirectForm(msg: string) {

  return render('reset-password', {
    title: 'Change Password',
    msg: msg,
    action: '/reset-password/change-password',
  });

}