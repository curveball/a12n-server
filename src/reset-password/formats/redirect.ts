import { render } from '../../templates.js';

export function resetPasswordForm(msg: string, error: string) {

  return render('resetpassword', {
    title: 'Reset Password',
    msg: msg,
    error: error,
    action: '/reset-password/change-password',
  }, 'minimal-form');

}
