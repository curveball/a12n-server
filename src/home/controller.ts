import Controller, { accept, method } from '@curveball/controller';
import { Context } from '@curveball/core';
import hal from './formats/hal.js';
import markdown from './formats/markdown.js';
import { getServerStats } from './service.js';
import { VERSION } from '../version.js';

class HomeController extends Controller {

  @method('GET')
  @accept('markdown')
  async getMd(ctx: Context) {

    const isAdmin = ctx.privileges.has('admin');
    const stats = await getServerStats();

    const user = ctx.auth.principal!;

    ctx.response.type = 'text/markdown';
    ctx.response.headers.set('Title', 'Home');
    ctx.response.headers.append('Link', [
      '</>; rel="alternate"; type="application/hal+json"',
      '</logout>; rel="logout"',
      `<${user.href}>; rel="authenticated-as" title="${user.nickname.replace('"','')}"`,
    ]);
    ctx.response.body = markdown(VERSION, user, isAdmin, stats);

  }

  @method('GET')
  @accept('application/hal+json')
  async getJson(ctx: Context) {

    const isAdmin = ctx.privileges.has('admin');
    const stats = await getServerStats();
    ctx.response.headers.append('Link', [
      '</>; rel="alternate"; type="text/markdown"',
    ]);
    ctx.response.body = hal(VERSION, ctx.auth.principal!, isAdmin, stats);

  }

}

export default new HomeController();
