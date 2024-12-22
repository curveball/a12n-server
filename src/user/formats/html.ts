import { render } from '../../templates.js';

type Options = {
  csrfToken: string;
  msg: string|undefined;
  error: string|undefined;
}

export function createUserForm(options: Options) {

  const hiddenFields: Record<string, string> = {
    'csrf-token': options.csrfToken,
  };

  return render('create-user', {
    title: 'Create User',
    msg: options.msg,
    error: options.error,
    action: '/user/new',
    hiddenFields,
  }, 'minimal-form');
}
