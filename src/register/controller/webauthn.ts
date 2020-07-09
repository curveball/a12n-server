import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import {
    generateAttestationOptions,
    verifyAttestationResponse,
  } from '@simplewebauthn/server';

type Device = {
    credentialID: string;
    publicKey: string;
    counter: number
}

type User = {
    username: string;
    devices: Device[];
    currentChallenge?: string;
}

class WebAuthnRegistrationRequestController extends Controller {

    // WORKING THROUGH EXAMPLE
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/example/index.js
    async get(ctx: Context) {
        const rpID = 'localhost';

        const user: User = {
            username: 'Test',
            devices: [],
        };

        const {
          /**
           * The username can be a human-readable name, email, etc... as it is intended only for display.
           */
          username,
          devices,
        } = user;

        /**
         * A new, random value needs to be generated every time an attestation is performed!
         * The server needs to temporarily remember this value for verification, so don't lose it until
         * after you verify an authenticator response.
         */
        const challenge = 'totallyUniqueValueEveryAttestation';
        //inMemoryUserDeviceDB[loggedInUserId].currentChallenge = challenge;

        ctx.response.body = generateAttestationOptions({
            serviceName: 'SimpleWebAuthn Example',
            rpID,
            challenge,
            userID: '1',
            userName: username,
            timeout: 60000,
            attestationType: 'direct',
            /**
             * Passing in a user's list of already-registered authenticator IDs here prevents users from
             * registering the same device multiple times. The authenticator will simply throw an error in
             * the browser if it's asked to perform an attestation when one of these ID's already resides
             * on it.
             */
            excludedCredentialIDs: devices.map(dev => dev.credentialID),
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

        const body = ctx.request.body;

        const user: User = {
            username: 'Test',
            devices: [],
            currentChallenge: 'totallyUniqueValueEveryAttestation'
        };

        const expectedChallenge = user.currentChallenge;

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

          const existingDevice = user.devices.find(device => device.credentialID === base64CredentialID);

          if (!existingDevice) {
            /**
             * Add the returned device to the user's list of devices
             */
            user.devices.push({
              publicKey: base64PublicKey,
              credentialID: base64CredentialID,
              counter,
            });
          }
        }

        ctx.response.body = { verified };
      }
}

export default new WebAuthnRegistrationRequestController();