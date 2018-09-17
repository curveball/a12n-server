import { Middleware } from '@curveball/core';
import { isClientError, isHttpError, HttpProblem } from '@curveball/http-errors';

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
        status = e.httpCode;
        clientError = isClientError(e);
        if ((<HttpProblem>e).title) {
          title = (<HttpProblem>e).title;
        }
        if ((<HttpProblem>e).detail) {
          detail = (<HttpProblem>e).detail;
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
        console.warn(e);
      } else {
        console.error(e);
        // Re-throwing for other HTTP handlers
        throw e;
      }

    }

  }

};
