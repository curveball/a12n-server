import nodemailer from 'nodemailer';
import { User } from '../user/types';


export async function sendResetPasswordEmail(user: User) {

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(process.env.SMTP_URL);

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"John Doe" <system@pegasi.badgateway.net>', // sender address
        to: user.identity.substring(7), // list of receivers
        subject: 'Reset Password Request', // Subject line
        text: 'Please click below link to reset your password!', // plain text body
        html: '<b>Please click below link to reset your password!</b>' // html body
    });
    
    nodemailer.getTestMessageUrl(info);
}
