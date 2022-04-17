import { render } from '../../templates';

export function createAppForm(msg: string, error: string) {

  return render('create-app', {
    title: 'Create App',
    msg: msg,
    error,
    action: '/app/new'
  });
}
