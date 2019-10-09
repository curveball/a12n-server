import { render } from '../../templates';

export function resetPasswordForm(msg: string) {

  return render('reset-password', {
    title: 'Reset Password',
    msg: msg,
    action: '/reset-password',
  });

}
