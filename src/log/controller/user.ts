import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as logService from '../service';
import * as userService from '../../user/service';
import csv from '../formats/csv';

class UserLogController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(ctx.state.params.id);
    const log = await logService.findByUser(user);

    ctx.response.type = 'text/csv';
    ctx.response.headers.append(
      'Link',
      [
        `</user/${user.id}>; rel=up; title="Back to user"`,
      ]
    );
    ctx.response.body = csv(log);

  }

}

export default new UserLogController();
