import { render } from '../../templates';

export function mfaForm(msg: string, error: string) {
  return render('mfa', {
    title: 'MFA',
    msg: msg,
    error: error,
    action: '/mfa',
  });

}
