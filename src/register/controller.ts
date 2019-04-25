import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import * as userService from '../user/service';
import { registrationFrom } from './formats/html';

class RegistrationController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = registrationFrom(ctx.query.msg);

  }

  async post(ctx: Context) {

    try {
      await userService.findByIdentity('mailto:' + ctx.request.body.emailaddress);
      throw new Error('User already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const user = await userService.save({
      identity: 'mailto:' + ctx.request.body.emailaddress,
      nickname: ctx.request.body.nickname,
      created: new Date(),
      type: 1
    });

    await userService.createPassword(user, ctx.request.body.password);


    ctx.status = 308;
    ctx.response.headers.set('Location', '/login?msg=Registration+successful.+Please log in');

  }

}

export default new RegistrationController();
