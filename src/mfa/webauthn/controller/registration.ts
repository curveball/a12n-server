import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

import * as webAuthnService from '../service.ts';
import { getSetting } from '../../../server-settings.ts';
import { User } from '../../../types.ts';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';


class WebAuthnAttestationController extends Controller {

  async get(ctx: Context) {
    const user: User = ctx.session.registerUser;

    const registrationOptions = await generateRegistrationOptions({
      rpName: getSetting('webauthn.serviceName'),
      rpID: getSetting('webauthn.relyingPartyId') || new URL(ctx.request.origin).host,
      userID: isoUint8Array.fromUTF8String(user.id.toString()),
      userName: user.href,
      userDisplayName: user.nickname,
      timeout: 60000,
      attestationType: 'indirect',
      excludeCredentials: (await webAuthnService.findDevicesByUser(user)).map(device => ({
        id: isoBase64URL.fromBuffer(device.credentialID),
        type: 'public-key',
      })),
      /**
       * The optional authenticatorSelection property allows for specifying more constraints around
       * the types of authenticators that users to can use for registration
       */
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    });

    ctx.session.webAuthnChallengeRegister = registrationOptions.challenge;
    ctx.response.body = registrationOptions;
  }

  async post(ctx: Context<any>) {
    const user: User = ctx.session.registerUser;
    const body = ctx.request.body;

    const expectedChallenge = ctx.session.webAuthnChallengeRegister;
    ctx.session.webAuthnChallengeRegister = null;

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: getSetting('webauthn.expectedOrigin') || ctx.request.origin,
        expectedRPID: getSetting('webauthn.relyingPartyId') || new URL(ctx.request.origin).host,
      });
    } catch (error: any) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      ctx.status = 400;
      ctx.response.body = { error: error.message };
      return;
    }

    const { verified, registrationInfo } = verification;

    if (verified) {
      const { credentialPublicKey, credentialID, counter } = registrationInfo!;

      const existingDevice = (await webAuthnService.findDevicesByUser(user)).find(device => device.credentialID.toString() === credentialID);

      if (!existingDevice) {
        await webAuthnService.save({
          user,
          credentialID: credentialPublicKey,
          publicKey: isoUint8Array.fromUTF8String(credentialID),
          counter,
        });

        ctx.session.registerUser = null;
      }
    }

    ctx.response.body = { verified };
  }
}

export default new WebAuthnAttestationController();
