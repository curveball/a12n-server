import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Conflict, NotFound } from '@curveball/http-errors';
import * as hal from '../formats/hal';
import * as usersService from '../service';

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const users = await usersService.findAll();
    ctx.response.body = hal.collection(users);

  }

  async post(ctx: Context) {

    try {
      await usersService.findByIdentity(ctx.request.body._links.me.href);
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw new Conflict('User alreadyt exists');
      }
    }
    const user = await usersService.save(
      hal.halToModel(ctx.request.body)
    );
    ctx.response.status = 201;
    ctx.response.headers.set('Location', `/user/${user.id}`);
  }

}

export default new UserCollectionController();
