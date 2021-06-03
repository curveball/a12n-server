import * as nodemailer from 'nodemailer';
import { render } from '../templates';
import { User } from '../principal/types';
import { createToken } from '../one-time-token/service';
import { getSetting } from '../server-settings';

/**
 * This function is for sending reset password email with validated token
 *
 * This flow, it will first check if email and URL environment variable has been set.
 *
 * Renders an email with provided from, to, subject, html template.
 */
export async function sendResetPasswordEmail(user: User) {

  const smtpEmailFrom = getSetting('smtp.emailFrom');
  const smtpUrl = getSetting('smtp.url');
  if (!smtpEmailFrom) {
    throw new Error('The \'smtp.emailFrom\' setting must be provided for email to work. You may set this via the SMTP_EMAIL_FROm environment variable or via the settings database.');
  }

  if (!smtpUrl) {
    throw new Error('The \'smtp.url\' setting must be provided for email to work. You may provide this via the SMTP_URL environment variable or via the settings database.');
  }

  const transporter = nodemailer.createTransport(smtpUrl);
  const token = await createToken(user);
  const emailTemplate = render('emails/reset-password-email', {
    name: user.nickname,
    url: process.env.PUBLIC_URI + 'reset-password/token/' + token.token,
    expiryHours: token.ttl / 60 / 60
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: smtpEmailFrom, // sender address
    to: user.identity.substring(7), // list of receivers
    subject: 'Password reset request', // Subject line
    html: emailTemplate
  });

  nodemailer.getTestMessageUrl(info);
}
