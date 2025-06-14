// DEBUG – anahtar geliyor mu?
console.log('SENDGRID KEY? ', process.env.SENDGRID_API_KEY?.slice(0,3));

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendArgs) {
  await sgMail.send({
    to,
    from: process.env.EMAIL_FROM!,   // » info@turlio.com
    subject,
    html,
  });
}