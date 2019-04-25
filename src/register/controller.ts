import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { registrationFrom } from './formats/html';
import * as userService from '../user/service'
import { NotFound } from '@curveball/http-errors';

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

  }

}

export default new RegistrationController();
