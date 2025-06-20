import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { isHttpError } from '@curveball/http-errors';
import { VerifyUriValidate } from '../../api-types.ts';
import * as uriVerification from '../service.ts';
import { verifySuccess, verifyFail } from '../formats/hal.ts';

class VerifyUriValidateController extends Controller {

  async post(ctx: Context) {
    ctx.privileges.require('a12n:verify-uri');
    ctx.request.validate<VerifyUriValidate>('https://curveballjs.org/schemas/a12nserver/verify-uri-validate.json');

    const { uri, code } = ctx.request.body;

    try {
      await uriVerification.verifyCode(uri, code);
      ctx.response.body = verifySuccess(uri);
    } catch (err) {
      if (isHttpError(err)) {
        ctx.status = err.httpStatus;
        ctx.response.body = verifyFail(uri, err);
      } else {
        throw err;
      }
    }
  }

}

export default new VerifyUriValidateController();
