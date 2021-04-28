import Controller, { accept, method } from '@curveball/controller';
import { Context } from '@curveball/core';
import hal from './formats/hal';
import markdown from './formats/markdown';
import * as privilegeService from '../privilege/service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../package.json').version;

class HomeController extends Controller {

  @method('GET')
  @accept('markdown')
  async getMd(ctx: Context) {

    const user = ctx.state.user;
    const isAdmin = await privilegeService.hasPrivilege(user, 'admin', '*');
    ctx.response.type = 'text/markdown';
    ctx.response.headers.set('Title', 'Home');
    ctx.response.headers.append('Link', [
      '</>; rel="alternate"; type="application/hal+json"',
      '</logout>; rel="logout"',
      `</user/${user.id}>; rel="authenticated-as" title="${user.nickname.replace('"','')}"`,
    ]);
    ctx.response.body = markdown(version, user, isAdmin);

  }

  @method('GET')
  @accept('application/hal+json')
  async getJson(ctx: Context) {

    const user = ctx.state.user;
    const isAdmin = await privilegeService.hasPrivilege(user, 'admin', '*');
    ctx.response.headers.append('Link', [
      '</>; rel="alternate"; type="text/markdown"',
    ]);
    ctx.response.body = hal(version, user, isAdmin);

  }

}

export default new HomeController();
