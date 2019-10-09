import nodemailer from 'nodemailer';
import { User } from '../user/types';


export async function sendResetPasswordEmail (user: User) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: '127.0.0.1',
        port: 25,
        secure: false, // true for 465, false for other ports
        tls: {
            rejectUnauthorized: false
        }
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"John Doe" <johndoe@badgateway.net>', // sender address
        to: user.identity.substring(7), // list of receivers
        subject: 'Reset Password Request', // Subject line
        text: 'Please click below link to reset your password!', // plain text body
        html: '<b>Please click below link to reset your password!</b>' // html body
    });
    nodemailer.getTestMessageUrl(info)
}