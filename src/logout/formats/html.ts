import { render } from '../../templates.ts';

export function logoutForm(msg: string, error: string, continueUri?: string) {

  const hiddenFields: Record<string, string> = {};
  if (continueUri) {
    hiddenFields['continue'] = continueUri;
  }

  return render('logout', {
    title: 'Logout',
    msg: msg,
    error: error,
    action: '/logout',
    hiddenFields,
  }, 'minimal-form');

}
