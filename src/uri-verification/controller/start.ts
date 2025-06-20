import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { VerifyUriStart } from '../../api-types.ts';
import * as uriVerification from '../../uri-verification/service.ts';
import { verifyResponseForm, verifyUriForm } from '../formats/hal.ts';

class VerifyUriStartController extends Controller {

  async get(ctx: Context) {
    ctx.privileges.require('a12n:verify-uri');
    ctx.response.body = verifyUriForm();
  }

  async post(ctx: Context) {
    ctx.request.validate<VerifyUriStart>('https://curveballjs.org/schemas/a12nserver/verify-uri-start.json');
    ctx.privileges.require('a12n:verify-uri');

    const { uri, name } = ctx.request.body;

    await uriVerification.sendVerificationRequest(uri, ctx.ip()!, name);

    ctx.status = 200;
    ctx.response.body = verifyResponseForm(uri);

  }

}

export default new VerifyUriStartController(); 
