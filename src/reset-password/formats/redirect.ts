import { render } from '../../templates';

export function resetPasswordForm(msg: string, error: string) {

  return render('resetpassword', {
    title: 'Reset Password',
    msg: msg,
    error: error,
    action: '/reset-password/change-password',
  });

}
