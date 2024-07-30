import { Middleware } from '@curveball/core';
import { isOAuth2Error } from './errors.js';

const oauth2ErrorHandler: Middleware = async (ctx, next) => {

  try {
    await next();
  } catch (err) {
    if (isOAuth2Error(err)) {

      /* eslint-disable-next-line no-console */
      console.log(err);

      ctx.status = err.httpStatus;
      ctx.response.type = 'application/json';
      ctx.response.body = err.serializeErrorBody();

    } else {
      // Let someone else deal with it
      throw err;
    }

  }

};

export default oauth2ErrorHandler;
