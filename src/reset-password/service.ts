import { PrincipalIdentity, User } from '../types.ts';
import { createToken } from '../verification-token/service.ts';
import { BadRequest } from '@curveball/http-errors';
import { sendTemplatedMail } from '../mailer/service.ts';
import { parseTemplate } from 'url-template';
import { getGlobalOrigin } from '@curveball/kernel';

/**
 * This function is for sending reset password email with validated token
 *
 * This flow, it will first check if email and URL environment variable has been set.
 *
 * Renders an email with provided from, to, subject, html template.
 */
export async function sendResetPasswordEmail(user: User, identity: PrincipalIdentity, urlTemplate?: string) {

  const reply = await getResetPasswordTokens(user, identity, urlTemplate);

  // send mail with defined transport object
  await sendTemplatedMail(
    {
      to: identity.uri.substring(7), // list of receivers
      subject: 'Password reset request', // Subject line
      templateName: 'emails/reset-password-email',
    },
    {
      name: user.nickname,
      url: reply.resetPasswordUrl,
      expiryHours: reply.ttl / 60 / 60
    }
  );

}

type ResetPasswordRequestReply = {
  token: string;
  ttl: number;
  expiresAt: number;
  email: string;
  resetPasswordUrl: string;
}

export async function getResetPasswordTokens(user: User, identity: PrincipalIdentity, urlTemplate?: string): Promise<ResetPasswordRequestReply> {

  const token = await createToken(user, null, identity);

  if (!identity.uri.startsWith('mailto:')) {
    throw new BadRequest('You can only request a password reset with an email address.');
  }

  const targetUrl = parseTemplate(urlTemplate || getGlobalOrigin() + '/reset-password/token/{token}').expand({
    token: token.token
  });

  return {
    resetPasswordUrl: targetUrl,
    token: token.token,
    ttl: token.ttl,
    expiresAt: Math.floor(token.expires.getTime()/1000),
    email: identity.uri.substring(7),
  };

}
