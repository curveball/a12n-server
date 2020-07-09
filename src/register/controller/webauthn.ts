import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import {
    generateAttestationOptions,
  } from '@simplewebauthn/server';


class WebAuthnRegistrationRequestController extends Controller {

    // WORKING THROUGH EXAMPLE
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/example/index.js
    async get(ctx: Context) {
        const rpID = 'dev.yourdomain.com';

        const user = {
            username: 'Test',
            devices: [{credentialID: '1'}],
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

        const assestationOptions = generateAttestationOptions({
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

        console.log(assestationOptions)
        ctx.response.body = assestationOptions;
      }

      async post(ctx: Context) {
        // const { body } = req;

        // const user = inMemoryUserDeviceDB[loggedInUserId];

        // const expectedChallenge = user.currentChallenge;

        // let verification;
        // try {
        //   verification = verifyAttestationResponse({
        //     credential: body,
        //     expectedChallenge,
        //     expectedOrigin: origin,
        //     expectedRPID: rpID,
        //   });
        // } catch (error) {
        //   console.error(error);
        //   return res.status(400).send({ error: error.message });
        // }

        // const { verified, authenticatorInfo } = verification;

        // if (verified) {
        //   const { base64PublicKey, base64CredentialID, counter } = authenticatorInfo;

        //   const existingDevice = user.devices.find(device => device.credentialID === base64CredentialID);

        //   if (!existingDevice) {
        //     /**
        //      * Add the returned device to the user's list of devices
        //      */
        //     user.devices.push({
        //       publicKey: base64PublicKey,
        //       credentialID: base64CredentialID,
        //       counter,
        //     });
        //   }
        // }

        // res.send({ verified });
      }
}

export default new WebAuthnRegistrationRequestController();