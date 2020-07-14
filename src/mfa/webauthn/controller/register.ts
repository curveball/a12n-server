import crypto from 'crypto';

import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { generateAttestationOptions, verifyAttestationResponse } from '@simplewebauthn/server';

import * as webAuthnService from '../service';
import { getSetting } from '../../../server-settings';
import { User } from '../../../user/types';


class WebAuthnRegistrationRequestController extends Controller {

  async get(ctx: Context) {
    const user: User = ctx.state.session.registerUser;

    /**
         * A new, random value needs to be generated every time an attestation is performed!
         * The server needs to temporarily remember this value for verification, so don't lose it until
         * after you verify an authenticator response.
         */
    const challenge = crypto.randomBytes(64).toString('hex');
    ctx.state.session.webAuthnChallenge = challenge;

    ctx.response.body = generateAttestationOptions({
      serviceName: getSetting('webauthn.serviceName'),
      rpID: getSetting('webauthn.relyingPartyId'),
      challenge,
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
  }

  async post(ctx: Context) {
    const user: User = ctx.state.session.registerUser;
    const body = ctx.request.body;

    const expectedChallenge = ctx.state.session.webAuthnChallenge;
    ctx.state.session.webAuthnChallenge = null;

    let verification;
    try {
      verification = await verifyAttestationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: getSetting('webauthn.expectedOrigin'),
        expectedRPID: getSetting('webauthn.relyingPartyId'),
      });
    } catch (error) {
      console.error(error);
      ctx.status = 400;
      ctx.response.body = { error: error.message };
      return;
    }

    const { verified, authenticatorInfo } = verification;

    if (verified) {
      const { base64PublicKey, base64CredentialID, counter } = authenticatorInfo;

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

export default new WebAuthnRegistrationRequestController();