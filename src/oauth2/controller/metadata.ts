import { Context } from '@curveball/core';
import Controller from '@curveball/controller';
import { metadata } from '../formats/json';

class MetadataController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'application/json';
    ctx.response.body = metadata();

  }

}

export default new MetadataController();
