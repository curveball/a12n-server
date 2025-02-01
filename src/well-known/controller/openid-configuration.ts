import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { metadata } from '../formats/json.js';

class OpenIdConfigurationController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'application/json';
    ctx.response.body = metadata();

  }

}

export default new OpenIdConfigurationController();
