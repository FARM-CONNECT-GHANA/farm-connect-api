import { createTransport } from "nodemailer";

export const transporter = createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  }
//   tls: {
//     ciphers: "SSLv3",
//   },
});
