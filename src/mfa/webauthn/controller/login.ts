import crypto from 'crypto';

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
    const { user }: MFALoginSession = ctx.state.session.mfa || {};

    const challenge = crypto.randomBytes(64).toString('hex');
    ctx.state.session.webAuthnChallengeLogin = challenge;

    ctx.response.body = generateAssertionOptions({
      challenge,
      timeout: 60000,
      allowedCredentialIDs: (await webauthnService.findDevicesByUser(user)).map(device => device.credentialID),
      /**
       * This optional value controls whether or not the authenticator needs be able to uniquely
       * identify the user interacting with it (via built-in PIN pad, fingerprint scanner, etc...)
       */
      userVerification: 'preferred',
    });
  }

  async post(ctx: Context) {
    const { user }: MFALoginSession = ctx.state.session.mfa || {};
    const body = ctx.request.body;

    const expectedChallenge = ctx.state.session.webAuthnChallengeLogin;
    ctx.state.session.webAuthnChallengeLogin = null;

    const authenticatorDevice = await webauthnService.findDeviceByUserAndId(user, body.id);

    let verification;
    try {
      verification = verifyAssertionResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: getSetting('webauthn.expectedOrigin'),
        expectedRPID: getSetting('webauthn.relyingPartyId'),
        authenticator: authenticatorDevice,
      });
    } catch (error) {
      log(EventType.totpFailed, ctx.ip(), user.id);
      ctx.status = 400;
      ctx.response.body = { error: error.message };
      return;
    }

    const { verified, authenticatorInfo } = verification;

    if (verified) {
      authenticatorDevice.counter = authenticatorInfo.counter;
      await webauthnService.save(authenticatorDevice);
    }

    ctx.state.session.mfa = null;
    ctx.state.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);
    ctx.response.body = { verified };
  }
}

export default new WebAuthnLoginRequestController();