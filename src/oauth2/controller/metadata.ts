import { Context, Middleware } from '@curveball/core';
import BaseController from '../../base-controller';
import { metadata } from '../formats/json';

class MetadataController extends BaseController {

  async get(ctx: Context) {

    ctx.response.type = 'application/json';
    ctx.response.body = metadata();

  }

}

function mw(): Middleware {
  const controller = new MetadataController();
  return controller.dispatch.bind(controller);
}

export default mw();
