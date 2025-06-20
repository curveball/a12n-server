import { MethodNotAllowed, BadRequest } from '@curveball/http-errors';
import { generateVerificationDigits } from '../crypto.ts';
import { sendTemplatedMail } from '../mailer/service.ts';
import { sendVerificationCode } from '../sms/service.ts';
import * as kv from '../kv/service.ts';

const CODE_LIFETIME_MINUTES = 30;
const verificationNS = 'a12n:uri-verification:';

/**
 * Sends a verification code to the specified URI (email or phone)
 */
export async function sendVerificationRequest(uri: string, ip: string, name: string): Promise<void> {
  const validatedUri = validateVerificationUri(uri);
  const uriObj = new URL(validatedUri);

  switch(uriObj.protocol) {
    case 'mailto:':
      await sendTemplatedMail({
        templateName: 'emails/verify-email',
        to: uriObj.pathname,
        subject: 'Verify your email',
      }, {
        code: await getCodeForUri(validatedUri),
        expireMinutes: CODE_LIFETIME_MINUTES,
        name,
        date: new Date().toISOString(),
        ip,
      });
      break;

    case 'tel:':
      await sendVerificationCode(
        uriObj.pathname,
        await getCodeForUri(validatedUri),
      );
      break;
    default:
      throw new MethodNotAllowed('Only mailto: and tel: URIs can be verified currently. Make a feature request if you want to support other kinds of URIs');
  }
}

/**
 * Sends an OTP code to the specified email URI
 */
export async function sendOtpRequest(uri: string, ip: string, name: string): Promise<void> {
  const validatedUri = validateVerificationUri(uri);
  if (!validatedUri.startsWith('mailto:')) {
    throw new MethodNotAllowed('Only email URIs are supported for OTP currently. Make a feature request if you want to support other kinds of URIs');
  }

  const uriObj = new URL(validatedUri);
  await sendTemplatedMail({
    templateName: 'emails/totp-email',
    to: uriObj.pathname,
    subject: 'Your login code',
  }, {
    code: await getCodeForUri(validatedUri),
    expireMinutes: CODE_LIFETIME_MINUTES,
    name: name,
    date: new Date().toISOString(),
    ip,
  });
}

/**
 * Verifies a code for the specified URI
 */
export async function verifyCode(uri: string, code: string): Promise<boolean> {
  const validatedUri = validateVerificationUri(uri);
  const storedCode = await kv.get<string>(verificationNS + validatedUri);
  // Delete code after, whether it was correct or not.
  await kv.del(verificationNS + validatedUri);

  if (storedCode === null) {
    throw new BadRequest('Verification code incorrect or expired. Try restarting the verification process');
  } else if (storedCode !== code) {
    throw new BadRequest('Verification code incorrect');
  }

  return true;
}

/**
 * Generates a secret code for a URI that may be used to validate ownership later.
 *
 * A URI will only have 1 active code.
 */
async function getCodeForUri(uri: string): Promise<string> {
  const code = generateVerificationDigits();
  await kv.set(
    verificationNS + uri,
    code,
    { ttl: CODE_LIFETIME_MINUTES * 60000 }
  );
  return code;
}

/**
 * Helper function to validate verification URI formats
 */
function validateVerificationUri(uri: string): string {
  const uriObj = new URL(uri);
  switch(uriObj.protocol) {
    case 'mailto:':
      if (/^[^@]+@[^@]+\.[^@]+$/.test(uriObj.pathname)) {
        return uriObj.toString();
      } else {
        throw new BadRequest('Invalid email address');
      }
    case 'tel:':
      if (/^\+?[0-9]+$/.test(uriObj.pathname)) {
        return uriObj.toString();
      } else {
        throw new BadRequest('Invalid phone number. We only currently support international phone numbers in the format tel:+[0-9]+, without spaces or other characters.');
      }
    default:
      throw new BadRequest('Invalid verification URI. Only mailto and tel URIs are supported for verification at the moment, but we want to support your use-case! Let us know');
  }
} 
