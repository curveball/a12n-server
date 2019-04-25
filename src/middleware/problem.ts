import { Middleware } from '@curveball/core';
import { HttpProblem, isClientError, isHttpError } from '@curveball/http-errors';

export default function(): Middleware {

  return async (ctx, next) => {

    try {
      await next();
    } catch (e) {

      let status: number;
      let clientError = false;
      let title = e.message;
      let detail;

      if (isHttpError(e)) {
        status = e.httpStatus;
        clientError = isClientError(e);
        if ((<HttpProblem> e).title) {
          title = (<HttpProblem> e).title;
        }
        if ((<HttpProblem> e).detail) {
          detail = (<HttpProblem> e).detail;
        }

      } else {
        status = 500;
      }

      ctx.response.status = status;
      ctx.response.headers.set('Content-Type', 'application/problem+json');
      ctx.response.body = {
        title: title,
        detail: detail,
        status: status
      };

      if (clientError) {
        // tslint:disable-next-line:no-console
        console.warn(e);
      } else {
        // tslint:disable-next-line:no-console
        console.error(e);
        // Re-throwing for other HTTP handlers
        // throw e;
      }

    }

  };

}
