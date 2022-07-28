import { render } from '../../templates';

export function createAppForm(msg: string, error: string, query: any) {

  return render('create-app', {
    title: 'Create App',
    msg,
    error,
    action: '/app/new',
    query
  });
}
