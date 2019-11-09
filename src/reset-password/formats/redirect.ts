import { render } from '../../templates';

export function resetPasswordForm(msg: string) {

  return render('resetpassword', {
    title: 'Reset Password',
    msg: msg,
    action: '/reset-password/change-password',
  });

}
