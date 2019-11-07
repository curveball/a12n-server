import { render } from '../../templates';

export function resetPasswordRequestForm(msg: string) {

  return render('reset-password', {
    title: 'Reset Password',
    msg: msg,
    action: '/reset-password',
  });

}
