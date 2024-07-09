import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import { PrincipalService } from '../../principal/service.js';
import csv from '../formats/csv.js';
import * as logService from '../service.js';

class UserLogController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id);
    const log = await logService.findByUser(user);

    if (ctx.auth.equals(user)) {
      if (!ctx.privileges.has('admin')) {
        throw new Forbidden('Only users with the "admin" privilege may inspect other users\' logs');
      }
    }

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
