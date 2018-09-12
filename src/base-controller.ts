import { Context } from '@curveball/core';
import * as errors from '@curveball/http-errors';
import http from 'http';

abstract class BaseController {

  dispatch(ctx: Context): Promise<void> | void {

    const method = ctx.request.method;
    if (!http.METHODS.includes(method)) {
      throw new errors.NotImplemented(method + ' is not implemented');
    }
    if ((<any> this)[method.toLowerCase()] === undefined) {
      throw new errors.MethodNotAllowed(
        method + ' is not allowed',
        this.allowedMethods()
      );
    }

    ctx.response.headers.set('Content-Type', 'application/hal+json');
    return (<any> this)[method.toLowerCase()](ctx);

  }

  allowedMethods(): string[] {

    const result = [];
    for (const method of http.METHODS) {

      if ((<any> this)[method.toLowerCase()] !== undefined) {
        result.push(method);
      }

    }
    return result;

  }

}

export default BaseController;
