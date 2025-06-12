// src/lib/stripe.ts
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    '❌  STRIPE_SECRET_KEY env değişkeni tanımlı değil!  .env.local dosyanı kontrol et.'
  );
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16', // Stripe’ın önerdiği en güncel stable versiyon
});
