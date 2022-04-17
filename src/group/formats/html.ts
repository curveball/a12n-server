import { render } from '../../templates';

export function createGroupForm(msg: string, error: string) {

  return render('create-group', {
    title: 'Create Group',
    msg: msg,
    error,
    action: '/group/new'
  });
}
