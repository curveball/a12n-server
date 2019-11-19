import { render } from '../../templates';

export function resetPasswordRequestForm(msg: string, error: string) {

  return render('resetpasswordrequest', {
    title: 'Reset Password',
    msg: msg,
    error: error,
    action: '/reset-password',
  });

}
