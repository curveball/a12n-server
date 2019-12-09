import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Conflict, NotFound, UnprocessableEntity } from '@curveball/http-errors';
import * as hal from '../formats/hal';
import * as usersService from '../service';

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const users = await usersService.findAll();
    ctx.response.body = hal.collection(users);

  }

  async post(ctx: Context) {

    const userBody = ctx.request.body;

    try {
      await usersService.findByIdentity(userBody._links.me.href);
      throw new Conflict('User already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    if (typeof userBody.nickname !== 'string') {
      throw new UnprocessableEntity('User nickname needs to be a string');
    }

    if (typeof userBody.active !== 'boolean') {
      throw new UnprocessableEntity('User active needs to be a boolean');
    }

    if (!hal.TypeMapInt.has(userBody.type)) {
      throw new UnprocessableEntity('User type needs to to be either user, group or app');
    }

    const user = await usersService.save(
      hal.halToModel(userBody)
    );

    ctx.response.status = 201;
    ctx.response.headers.set('Location', `/user/${user.id}`);
  }

}

export default new UserCollectionController();
