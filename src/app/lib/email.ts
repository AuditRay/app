import 'server-only';
import Mail from "nodemailer/lib/mailer";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_DOMAIN!,
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.SMTP_USERNAME!,
        pass: process.env.SMTP_PASSWORD!,
    },
});


export async function sendEmail(to: string, subject: string, html: string) {
    const data: Mail.Options = {
        from: 'Monit <info@monit.dev>',
        to,
        subject,
        html,
    };
    return transporter.sendMail(data);
}