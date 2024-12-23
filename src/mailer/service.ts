import * as nodemailer from 'nodemailer';
import { requireSetting } from '../server-settings.js';
import { render } from '../templates.js';

export function getEmailTransport() {

  const smtpUrl = requireSetting('smtp.url')!;
  return nodemailer.createTransport(smtpUrl);

}

export function getDefaultSender() {

  return requireSetting('smtp.emailFrom')!;

}

type Email = {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(emailInfo: Email) {

  const transporter = getEmailTransport();
  await transporter.sendMail({
    from: getDefaultSender(),
    to: emailInfo.to,
    subject: emailInfo.subject,
    html: emailInfo.html,
  });

}

type TemplatedEmail = {
  to: string;
  subject: string;
  templateName: string;
}
export async function sendTemplatedMail(emailInfo: TemplatedEmail, templateVariables: Record<string, string | number>) {

  return sendMail({
    to: emailInfo.to,
    subject: emailInfo.subject,
    html: render(emailInfo.templateName, templateVariables, 'email')
  });

}
