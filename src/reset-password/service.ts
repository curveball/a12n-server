import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import database from '../database';
import { User } from '../user/types';

export async function sendResetPasswordEmail(user: User) {

    if (!process.env.SMTP_EMAIL_FROM) {
        throw new Error('The environment variable SMTP_EMAIL_FROM must be set');
    }

    if (!process.env.SMTP_URL) {
        throw new Error('The environment variable SMTP_URL must be set. Needs to contain "smtps://[Username]:[Password]@[Host]:[Port]"');
    }

    const transporter = nodemailer.createTransport(process.env.SMTP_URL);


    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: process.env.SMTP_EMAIL_FROM, // sender address
        to: user.identity.substring(7), // list of receivers
        subject: 'Reset Password Link', // Subject line
        text: 'Please click link below to reset your password.', // plain text body
        html: '<b>Please click link below to reset your password!</b>' // html body
    });

    nodemailer.getTestMessageUrl(info);
}

export async function createToken(user: User): Promise<string> {
    const token = crypto.randomBytes(32).toString('base64url').replace('=', '');
    const query = 'INSERT INTO reset_password_token SET user_id = ?, token = ?, created_at = UNIX_TIMESTAMP()';
    await database.query(query, [
        user.id,
        await bcrypt.hash(token, 12),
    ]);
    return token;
}

export async function validateToken(user: User, token: string): Promise<boolean> {
    const query = 'SELECT token FROM reset_password_token WHERE user_id = ?';
    const result = await database.query(query, [user.id]);

    const hashes: string[] = result[0].map( (row: { token: string }) => row.token );

    for (const hash of hashes) {
        if (await bcrypt.compare(token, hash)) {
            return true;
        }
    }

    return false;
}
