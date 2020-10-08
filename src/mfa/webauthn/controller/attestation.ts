import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { generateAttestationOptions, verifyAttestationResponse } from '@simplewebauthn/server';

import * as webAuthnService from '../service';
import { getSetting } from '../../../server-settings';
import { User } from '../../../user/types';


class WebAuthnAttestationController extends Controller {

  async get(ctx: Context) {
    const user: User = ctx.state.session.registerUser;

    const attestationOptions = generateAttestationOptions({
      serviceName: getSetting('webauthn.serviceName'),
      rpID: getSetting('webauthn.relyingPartyId', new URL(process.env.PUBLIC_URI!).host),
      userID: user.id.toString(),
      userName: user.nickname,
      timeout: 60000,
      attestationType: 'direct',
      excludedCredentialIDs: (await webAuthnService.findDevicesByUser(user)).map(device => device.credentialID),
      /**
       * The optional authenticatorSelection property allows for specifying more constraints around
       * the types of authenticators that users to can use for attestation
       */
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    });

    ctx.state.session.webAuthnChallengeRegister = attestationOptions.challenge;
    ctx.response.body = attestationOptions;
  }

  async post(ctx: Context) {
    const user: User = ctx.state.session.registerUser;
    const body = ctx.request.body;

    const expectedChallenge = ctx.state.session.webAuthnChallengeRegister;
    ctx.state.session.webAuthnChallengeRegister = null;

    let verification;
    try {
      verification = await verifyAttestationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: getSetting('webauthn.expectedOrigin', new URL(process.env.PUBLIC_URI!).origin),
        expectedRPID: getSetting('webauthn.relyingPartyId', new URL(process.env.PUBLIC_URI!).host),
      });
    } catch (error) {
      console.error(error);
      ctx.status = 400;
      ctx.response.body = { error: error.message };
      return;
    }

    const { verified, authenticatorInfo } = verification;

    if (verified) {
      const { base64PublicKey, base64CredentialID, counter } = authenticatorInfo!;

      const existingDevice = (await webAuthnService.findDevicesByUser(user)).find(device => device.credentialID === base64CredentialID);

      if (!existingDevice) {
        await webAuthnService.save({
          user,
          credentialID: base64CredentialID,
          publicKey: base64PublicKey,
          counter,
        });

        ctx.state.session.registerUser = null;
      }
    }

    ctx.response.body = { verified };
  }
}

export default new WebAuthnAttestationController();
