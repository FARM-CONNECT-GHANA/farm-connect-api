import {createTransport} from 'nodemailer';

export const transporter = createTransport({
    host: "sandbox.smtp.mailtrap.io", 
    port: 2525,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME, 
        pass: process.env.SMTP_PASSWORD, 
    },
});
