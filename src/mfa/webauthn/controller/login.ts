import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { generateAssertionOptions, verifyAssertionResponse } from '@simplewebauthn/server';

import log from '../../../log/service';
import { EventType } from '../../../log/types';

import * as webauthnService from '../service';
import { MFALoginSession } from '../../types';

class WebAuthnLoginRequestController extends Controller {

    async get(ctx: Context) {
        const { user }: MFALoginSession = ctx.state.session.mfa || {};
        const challenge = 'totallyUniqueValueEveryAssertion';

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
        const rpID = 'localhost';
        const origin = 'http://localhost:8531';

        const { user }: MFALoginSession = ctx.state.session.mfa || {};
        const body = ctx.request.body;
        const expectedChallenge = 'totallyUniqueValueEveryAssertion';

        const authenticatorDevice = await webauthnService.findDeviceByUserAndId(user, body.id);

        let verification;
        try {
          verification = verifyAssertionResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: authenticatorDevice,
          });
        } catch (error) {
          console.error(error);
          ctx.status = 400;
          ctx.response.body = { error: error.message };
          return
        }

        const { verified, authenticatorInfo } = verification;

        if (verified) {
          // Update the authenticator's counter in the DB to the newest count in the assertion
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