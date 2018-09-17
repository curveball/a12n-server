import { Context, Middleware } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import BaseController from '../../base-controller';
import * as permissionService from '../../permission/service';
import * as userHal from '../../user/formats/hal';
import * as userService from '../../user/service';
import * as oauthErrors from '../errors';
import * as oauth2Service from '../service';

class ValidateBearerController extends BaseController {

  async post(ctx: Context) {

    if (ctx.request.type !== 'application/json') {
      throw new BadRequest('Request must have an application/json Content-Type');
    }

    //if (!await permissionService.hasPermission(ctx.state.session.data.user.id, 'validate-bearer')) {
    //  throw new Forbidden('The "validate-bearer" permission is required to call this endpoint');
    //}

    const bearer = ctx.request.body.bearer;

    const token = await oauth2Service.getTokenByAccessToken(bearer);
    const user = await userService.findById(token.userId);
    const permissions = await permissionService.getPermissionsForUser(user);

    ctx.response.body = userHal.item(user, permissions);

  }

  /**
   * We're overriding the default dipatcher to catch OAuth2 errors.
   */
  async dispatch(ctx: Context): Promise<void> {

    try {
      await super.dispatch(ctx);
    } catch (err) {
      if (err.errorCode) {
        oauthErrors.serializeError(ctx, err);
      } else {
        throw err;
      }
    }

  }

}

function mw(): Middleware {
  const controller = new ValidateBearerController();
  return controller.dispatch.bind(controller);
}

export default mw();
