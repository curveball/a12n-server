import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as siren from '../formats/siren';
import { Forbidden } from '@curveball/http-errors';
import * as userService from '../../user/service';
import { App } from '../../user/types';

class NewClientController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id) as App;
    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can add new OAuth2 clients');
    }

    ctx.response.type = 'application/vnd.siren+json';
    ctx.response.body = siren.newClient(user);

  }

}

export default new NewClientController();
