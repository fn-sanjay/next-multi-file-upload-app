import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailVerification(to: string, url: string) {
  await transporter.sendMail({
    from: `"Cloud Vault" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${url}">${url}</a>
      <p>This link expires in 10 minutes.</p>
    `,
  });
}
