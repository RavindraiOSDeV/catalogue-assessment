import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}

export const env = {
  port,
  productApiUrl: (process.env.PRODUCT_API_URL ?? 'https://fakestoreapi.com').replace(/\/$/, ''),
  salesEmail: process.env.SALES_EMAIL ?? 'sales@example.com',
  emailProvider: process.env.EMAIL_PROVIDER ?? 'console',
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpSecure: process.env.SMTP_SECURE === 'true',
};
