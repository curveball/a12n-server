import { Context } from '@curveball/core';
import http from 'http';
import * as errors from './errors';

abstract class BaseController {

  dispatch(ctx: Context): Promise<void> | void {

    const method = ctx.request.method;
    if (!http.METHODS.includes(method)) {
      throw new errors.NotImplemented(method + ' is not implemented');
    }
    if ((<any> this)[method.toLowerCase()] === undefined) {
      throw new errors.MethodNotAllowed(method + ' is not allowed');
    }

    ctx.response.headers.set('Content-Type', 'application/hal+json');
    return (<any> this)[method.toLowerCase()](ctx);

  }

}

export default BaseController;
