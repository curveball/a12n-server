import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as errors from '@curveball/http-errors';
import fs from 'fs';

class BlobController extends Controller {

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

export default new BlobController();
