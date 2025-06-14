import 'dotenv/config';                // .env.local'ı otomatik okur
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

(async () => {
  try {
    await sgMail.send({
      to: process.argv[2] || process.env.EMAIL_FROM,   // ilk argüman yoksa kendinize
      from: process.env.EMAIL_FROM,                    // SendGrid’te onaylı adres
      subject: 'Turlio test ✔︎',
      text: 'Bu bir deneme mesajıdır.',
    });
    console.log('✅ Test maili yollandı');
  } catch (err) {
    console.error('❌ SEND ERROR', err.response?.body || err);
  }
})();

