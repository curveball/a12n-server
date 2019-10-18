import nodemailer from 'nodemailer';
import { User } from '../user/types';

export async function sendResetPasswordEmail(user: User) {

    if (!process.env.SMTP_EMAIL_FROM) {
        throw new Error('The environment variable SMTP_EMAIL_FROM must be set');
    }

    if (!process.env.SMPT_URL) {
        throw new Error('The environment variable SMTP_URL must be set. Needs to contain "smtps://[Username]:[Password]@[Host]:[Port]"');
    }

    const transporter = nodemailer.createTransport(process.env.SMTP_URL);


    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Admin" <' + process.env.SMTP_EMAIL_FROM + '>', // sender address
        to: user.identity.substring(7), // list of receivers
        subject: 'Reset Password Link', // Subject line
        text: 'Please click link below to reset your password.', // plain text body
        html: '<b>Please click link below to reset your password!</b>' // html body
    });

    nodemailer.getTestMessageUrl(info);
}
