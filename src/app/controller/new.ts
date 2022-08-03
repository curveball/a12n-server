import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import * as principalService from '../../principal/service';
import { createAppForm } from '../formats/html';
import { uuidUrn } from '../../crypto';

type AppNewForm = {
  nickname: string;
  url: string;
  clientId?: string;
  allowGrantTypes?: string;
  redirectUris?: string;
  requirePkce?: string;
}

class CreateAppController extends Controller {

  async get(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new users');
    }
    ctx.response.type = 'text/html';
    ctx.response.body = createAppForm(ctx.query.msg, ctx.query.error, ctx.query.name, ctx.query.url, ctx.query.clientId, ctx.query.allowGrantTypes, ctx.query.redirectUris, ctx.query.requirePkce);
  }

  async post(ctx: Context) {

    ctx.request.validate<AppNewForm>('https://curveballjs.org/schemas/a12nserver/app-new-form.json');

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new apps');
    }

    const nickname = ctx.request.body.nickname;
    const identity = ctx.request.body.url || uuidUrn();

    const newApp = await principalService.save({
      type: 'app',
      nickname,
      active: true,
      identity,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 303;

    let newLocation = newApp.href;

    if (ctx.request.body.clientId || ctx.request.body.allowGrantTypes || ctx.request.body.redirectUris || ctx.request.body.requirePkce ) {
      const params = {
        ...(ctx.request.body.clientId && {
          clientId: ctx.request.body.clientId
        }),
        ...(ctx.request.body.allowGrantTypes && {
          allowGrantTypes: ctx.request.body.allowGrantTypes
        }),
        ...(ctx.request.body.redirectUris && {
          redirectUris: ctx.request.body.redirectUris
        }),
        ...(ctx.request.body.requirePkce && {
          requirePkce: ctx.request.body.requirePkce
        }),
      };

      newLocation = `${newLocation}/client/new?${new URLSearchParams(params)}`;
    }

    ctx.response.status = 303;
    ctx.response.headers.set('Location', newLocation);
  }

}
export default new CreateAppController();
