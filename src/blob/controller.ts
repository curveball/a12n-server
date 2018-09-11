import { Context, Middleware } from '@curveball/core';
import fs from 'fs';
import BaseController from '../base-controller';
import * as errors from '@curveball/http-errors';

class BlobController extends BaseController {

  get(ctx: Context) {

    switch (ctx.state.params.filename) {

      case 'form.css' :
        ctx.response.body = fs.readFileSync(__dirname + '/../../assets/' + ctx.state.params.filename);
        ctx.response.type = 'text/css';
        break;
      default:
        throw new errors.NotFound('File not found!');
        break;
    }

  }

}

function mw(): Middleware {
  const controller = new BlobController();
  return controller.dispatch.bind(controller);
}

export default mw();
