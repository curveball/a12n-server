import { render } from '../../templates';

export function resetPasswordRequestForm(msg: string) {

  return render('resetpasswordrequest', {
    title: 'Reset Password',
    msg: msg,
    action: '/reset-password',
  });

}
