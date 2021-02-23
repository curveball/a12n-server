import * as nodemailer from 'nodemailer';
import { render } from '../templates';
import { User } from '../user/types';
import { createToken } from '../one-time-token/service';


/**
 * This function is for sending reset password email with validated token
 *
 * This flow, it will first check if email and URL environment variable has been set.
 *
 * Renders an email with provided from, to, subject, html template.
 */
export async function sendResetPasswordEmail(user: User) {

  if (!process.env.SMTP_EMAIL_FROM) {
    throw new Error('The environment variable SMTP_EMAIL_FROM must be set');
  }

  if (!process.env.SMTP_URL) {
    throw new Error('The environment variable SMTP_URL must be set. Needs to contain "smtps://[Username]:[Password]@[Host]:[Port]"');
  }

  const transporter = nodemailer.createTransport(process.env.SMTP_URL);
  const token = await createToken(user);
  const emailTemplate = render('emails/reset-password-email', {
    name: user.nickname,
    url: process.env.PUBLIC_URI + 'reset-password/token/' + token.token,
    expiryHours: token.ttl / 60 / 60
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.SMTP_EMAIL_FROM, // sender address
    to: user.identity.substring(7), // list of receivers
    subject: 'Password reset request', // Subject line
    html: emailTemplate
  });

  nodemailer.getTestMessageUrl(info);
}
