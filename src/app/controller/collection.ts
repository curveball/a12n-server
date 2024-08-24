import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Conflict, UnprocessableContent } from '@curveball/http-errors';
import * as hal from '../formats/hal.js';
import * as services from '../../services.js';
import { PrincipalNew } from '../../api-types.js';

class AppCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const apps = await principalService.findAll('app');
    ctx.response.body = hal.collection(apps);

  }

  async post(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);

    ctx.request.validate<PrincipalNew>(
      'https://curveballjs.org/schemas/a12nserver/principal-new.json'
    );

    if (ctx.request.body.type !== 'app') {
      throw new BadRequest('You may only create principals with type "app" at this endpoint');
    }

    let identity = null;
    if (ctx.request.links.has('me')) {
      identity = ctx.request.links.get('me')!;
      if (!identity.href.match(/^https?:(.*)$/)) {
        throw new UnprocessableContent('App "me" URI must be a http or https URI');
      }
      if (await services.principalIdentity.findByUri(identity.href)) {
        throw new Conflict(`The uri "${identity.href}" already exists`);
      }
    }

    const app = await principalService.save({
      nickname: ctx.request.body.nickname,
      type: 'app',
      active: true,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    if (identity) {
      await services.principalIdentity.create({
        uri: identity.href,
        principal: app,
        isPrimary: true,
        label: identity.title ?? null,
        markVerified: false,
      });

    }

    ctx.response.status = 201;
    ctx.response.headers.set('Location', app.href);
  }

}

export default new AppCollectionController();
