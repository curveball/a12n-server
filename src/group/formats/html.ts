import { render } from '../../templates';
import { User } from '../../user/types';

export function addUserToGroupMemberForm(user: User,msg: string, error: string) {

  return render('add-member-to-group', {
    title: 'Add User To Group',
    msg: msg,
    error,
    type: 'number',
    action: `/user/${user.id}/member/new`
  });
}
