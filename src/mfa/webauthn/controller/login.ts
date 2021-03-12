import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { generateAssertionOptions, verifyAssertionResponse } from '@simplewebauthn/server';

import log from '../../../log/service';
import { EventType } from '../../../log/types';
import { getSetting } from '../../../server-settings';

import * as webauthnService from '../service';
import { MFALoginSession } from '../../types';

class WebAuthnLoginRequestController extends Controller {

  async get(ctx: Context) {
    const { user }: MFALoginSession = ctx.session.mfa || {};

    const assertionOptions = generateAssertionOptions({
      timeout: 60000,
      allowCredentials: (await webauthnService.findDevicesByUser(user)).map(device => ({
        id: device.credentialID,
        type: 'public-key',
      })),
      /**
       * This optional value controls whether or not the authenticator needs be able to uniquely
       * identify the user interacting with it (via built-in PIN pad, fingerprint scanner, etc...)
       */
      userVerification: 'preferred',
    });

    ctx.session.webAuthnChallengeLogin = assertionOptions.challenge;
    ctx.response.body = assertionOptions;
  }

  async post(ctx: Context<any>) {
    const { user }: MFALoginSession = ctx.session.mfa || {};
    const body = ctx.request.body;

    const expectedChallenge = ctx.session.webAuthnChallengeLogin;
    ctx.session.webAuthnChallengeLogin = null;

    const authenticatorDevice = await webauthnService.findDeviceByUserAndId(user, body.id);

    let verification;
    try {
      verification = verifyAssertionResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: getSetting('webauthn.expectedOrigin', new URL(process.env.PUBLIC_URI!).origin),
        expectedRPID: getSetting('webauthn.relyingPartyId', new URL(process.env.PUBLIC_URI!).host),
        authenticator: {
          credentialID: authenticatorDevice.credentialID,
          counter: authenticatorDevice.counter,
          credentialPublicKey: authenticatorDevice.publicKey,
        }
      });
    } catch (error) {
      log(EventType.totpFailed, ctx.ip(), user.id);
      ctx.status = 400;
      ctx.response.body = { error: error.message };
      return;
    }

    const { verified, assertionInfo } = verification;

    if (verified) {
      authenticatorDevice.counter = assertionInfo.newCounter;
      await webauthnService.save(authenticatorDevice);
    }

    ctx.session.mfa = null;
    ctx.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);
    ctx.response.body = { verified };
  }
}

export default new WebAuthnLoginRequestController();
