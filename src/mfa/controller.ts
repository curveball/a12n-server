import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import querystring from 'querystring';

import { mfaForm } from './formats/html';

import log from '../log/service';
import { EventType } from '../log/types';
import * as userService from '../user/service';
import { User } from '../user/types';

class MFAController extends Controller {

    async get(ctx: Context) {
        let user: User = ctx.state.session.mfa_user;

        if (!user) {
            return this.redirectToLogin(ctx);
        }

        ctx.response.type = 'text/html';
        ctx.response.body = mfaForm(
          ctx.query.msg,
          ctx.query.error,
        );

      }

    async post(ctx: Context) {

        let user: User = ctx.state.session.mfa_user;

        if (!user) {
            return this.redirectToLogin(ctx);
        }

        if (ctx.request.body.totp) {
          if (!await userService.validateTotp(user, ctx.request.body.totp)) {
            log(EventType.totpFailed, ctx.ip(), user.id);
            return this.redirectToMfa(ctx, 'Incorrect TOTP code');
          }
        } else {
          return this.redirectToMfa(ctx, 'TOTP token required');
        }

        ctx.state.session = {
          user: user,
        };
        log(EventType.loginSuccess, ctx);
        ctx.status = 303;
        ctx.response.headers.set('Location', '/');

    }

    async redirectToMfa(ctx: Context, error: string) {

        ctx.response.status = 303;
        ctx.response.headers.set('Location', '/mfa?' + querystring.stringify({ error }));

    }

    async redirectToLogin(ctx: Context) {

        ctx.response.status = 303;
        ctx.response.headers.set('Location', '/login');

    }
}

export default new MFAController();