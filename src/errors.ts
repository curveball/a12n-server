export class HttpError extends Error {
  httpCode: number = 500;
}

export class BadRequest extends HttpError {
  httpCode = 400;
}

export class NotFound extends HttpError {
  httpCode = 404;
}

export class MethodNotAllowed extends HttpError {
  httpCode = 405;
}

export class NotImplemented extends HttpError {
  httpCode = 501;
}
