import { render } from '../../templates';
type KeyValue = { [key: string]: string };

export function mfaForm(msg: string, error: string, hiddenFields: KeyValue) {
  return render('mfa', {
    title: 'MFA',
    msg: msg,
    error: error,
    hiddenFields: hiddenFields,
    action: '/mfa',
  });

}
