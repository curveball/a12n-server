import { render } from '../../templates';

export function createAppForm(msg: string, error: string, name: string, url: string) {

  return render('create-app', {
    title: 'Create App',
    msg,
    error,
    action: '/app/new',
    name,
    url
  });
}
