import { render } from '../../templates';

export function createAppForm(msg: string, error: string, name: string, url: string, clientId: string, allowGrantTypes: string, redirectUris: string, requirePkce: string) {

  const hiddenFields: Record<string, string> = {};

  if (clientId) {
    hiddenFields['clientId'] = clientId;
  }

  if (allowGrantTypes) {
    hiddenFields['allowGrantTypes'] = allowGrantTypes;
  }

  if (redirectUris) {
    hiddenFields['redirectUris'] = redirectUris;
  }

  if (requirePkce) {
    hiddenFields['requirePkce'] = requirePkce;
  }

  return render('create-app', {
    title: 'Create App',
    msg,
    error,
    action: '/app/new',
    name,
    url,
    hiddenFields
  });
}
