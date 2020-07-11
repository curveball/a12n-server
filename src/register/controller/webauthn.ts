import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import {
  generateAttestationOptions,
  verifyAttestationResponse,
} from '@simplewebauthn/server';

import * as webauthnService from '../../mfa/webauthn/service';
import { User } from '../../user/types';


class WebAuthnRegistrationRequestController extends Controller {

    // WORKING THROUGH EXAMPLE
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/example/index.js
    async get(ctx: Context) {
        const rpID = 'localhost';

        const user: User = ctx.state.session.register_user;

        /**
         * A new, random value needs to be generated every time an attestation is performed!
         * The server needs to temporarily remember this value for verification, so don't lose it until
         * after you verify an authenticator response.
         */
        const challenge = 'totallyUniqueValueEveryAttestation';

        ctx.response.body = generateAttestationOptions({
            serviceName: 'SimpleWebAuthn Example',
            rpID,
            challenge,
            userID: user.id.toString(),
            userName: user.nickname,
            timeout: 60000,
            attestationType: 'direct',
            excludedCredentialIDs: (await webauthnService.findWebAuthnDevicesByUser(user)).map(device => device.credentialId),
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
        const rpID = 'localhost';
        const origin = 'http://localhost:8531'

        const user: User = ctx.state.session.register_user;
        const body = ctx.request.body;
        const expectedChallenge = 'totallyUniqueValueEveryAttestation';

        let verification;
        try {
          verification = verifyAttestationResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
          });
        } catch (error) {
          console.error(error);
          ctx.status = 400;
          ctx.response.body = { error: error.message };
          return
        }

        const { verified, authenticatorInfo } = verification;

        if (verified) {
          const { base64PublicKey, base64CredentialID, counter } = authenticatorInfo;

          const existingDevice = (await webauthnService.findWebAuthnDevicesByUser(user)).find(device => device.credentialId === base64CredentialID);

          if (!existingDevice) {
            await webauthnService.save({
              user,
              credentialId: base64CredentialID,
              publicKey: base64PublicKey,
              counter,
            });

            ctx.state.session.register_user = null;
          }
        }

        ctx.response.body = { verified };
      }
}

export default new WebAuthnRegistrationRequestController();