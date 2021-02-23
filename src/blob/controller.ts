import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as errors from '@curveball/http-errors';
import * as fs from 'fs';

class BlobController extends Controller {

  get(ctx: Context) {

    switch (ctx.params.filename) {

      case 'form.css' :
        ctx.response.body = fs.readFileSync(__dirname + '/../../assets/' + ctx.params.filename);
        ctx.response.type = 'text/css';
        break;
      case 'simplewebauthn-browser.min.js' :
        ctx.response.body = fs.readFileSync(__dirname + '/../../node_modules/@simplewebauthn/browser/dist/' + ctx.params.filename);
        ctx.response.type = 'text/javascript';
        break;
      case 'simplewebauthn-browser.min.js.map' :
        ctx.response.body = fs.readFileSync(__dirname + '/../../node_modules/@simplewebauthn/browser/dist/' + ctx.params.filename);
        ctx.response.type = 'text/pain';
        break;
      case 'webauthn.js' :
        ctx.response.body = fs.readFileSync(__dirname + '/../../assets/' + ctx.params.filename);
        ctx.response.type = 'application/javascript';
        break;
      default:
        throw new errors.NotFound('File not found!');
        break;
    }

  }

}

export default new BlobController();
