import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { metadata } from '../../oauth2/formats/json.js';

class MetadataController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'application/json';
    ctx.response.body = metadata();

  }

}

export default new MetadataController();
