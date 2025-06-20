/* ────────────────────────────────────────────────
   src/lib/sendEmail.ts
   – SendGrid üzerinden posta gönderimi
──────────────────────────────────────────────── */

import sgMail from '@sendgrid/mail'

/* 1) Env doğrulaması ----------------------------------------- */
const API_KEY   = process.env.SENDGRID_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM

if (!API_KEY || !EMAIL_FROM) {
  console.error(
    '❌ SENDGRID yapılandırması eksik\n' +
    '  SENDGRID_API_KEY: %s\n' +
    '  EMAIL_FROM      : %s',
    API_KEY ? '✓ var' : '⛔ yok',
    EMAIL_FROM || '⛔ yok',
  )
  // Eksikse yine de uygulama çalışsın ama mail fonksiyonu uyarı versin
} else {
  sgMail.setApiKey(API_KEY)
  console.log(
    '📨 SendGrid hazır  (API %s…)',
    API_KEY.slice(0, 4).padEnd(8, '*'),
  )
}

/* 2) Tip tanımı --------------------------------------------- */
interface MailArgs {
  to: string
  subject: string
  html: string
}

/* 3) Gönderim fonksiyonu ------------------------------------ */
export async function sendEmail({ to, subject, html }: MailArgs) {
  if (!API_KEY || !EMAIL_FROM) {
    console.warn(
      '⚠️ Mail gönderilemedi; env eksik (to=%s, subject=%s)',
      to,
      subject,
    )
    return
  }

  try {
    await sgMail.send({
      to,
      from   : EMAIL_FROM,
      subject,
      html,
    })
    console.log('📧 OK ✅  Mail gönderildi → %s', to)
  } catch (err) {
    console.error('❌ E‑posta gönderilemedi → %s\n%O', to, err)
    // Hatanın ana akışı bozmasını istemiyorsak throw etmiyoruz
  }
}
