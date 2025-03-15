import { Controller } from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import * as services from '../../services.ts';
import { toUserInfo } from '../format/json.ts';

class OidcUserInfoController extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const user = await principalService.findById(ctx.auth.principal!.id);
    if (user.type !== 'user') {
      throw new BadRequest('This endpoint can only be accessed with credentials representing users. The credentials you used are associated with a principal of type: ' + user.type);
    }
    const identities = await services.principalIdentity.findByPrincipal(user);

    ctx.response.body = toUserInfo(user, identities);
  }

}

export default new OidcUserInfoController();
