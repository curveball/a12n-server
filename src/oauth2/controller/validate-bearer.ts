import { Context, Middleware } from '@curveball/core';
import { BadRequest, NotFound } from '@curveball/http-errors';
import BaseController from '../../base-controller';
import * as privilegeService from '../../privilege/service';
import * as userHal from '../../user/formats/hal';
import * as userService from '../../user/service';
import * as oauth2Service from '../service';

class ValidateBearerController extends BaseController {

  async post(ctx: Context) {

    if (ctx.request.type !== 'application/json') {
      throw new BadRequest('Request must have an application/json Content-Type');
    }

    const bearer = ctx.request.body.bearer;
    if (!bearer) {
      throw new BadRequest('The "bearer" property must be provided');
    }

    let token;
    try {

      token = await oauth2Service.getTokenByAccessToken(bearer);

    } catch (err) {

      if (err instanceof NotFound) {
        throw new BadRequest('Unknown access token');
      } else {
        throw err;
      }

    }

    const user = await userService.findById(token.userId);
    const privileges = await privilegeService.getPrivilegesForUser(user);

    ctx.response.body = userHal.item(user, privileges);

  }

}


function mw(): Middleware {
  const controller = new ValidateBearerController();
  return controller.dispatch.bind(controller);
}

export default mw();
