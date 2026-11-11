import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import type { EnquiryInput, Product } from '../types/product.js';

export interface EmailSender {
  send(input: EnquiryInput, product: Product): Promise<void>;
}

class ConsoleEmailProvider implements EmailSender {
  async send(input: EnquiryInput, product: Product): Promise<void> {
    // Local assessment mode: no external account is needed. Review this log
    // in the backend terminal after submitting an enquiry from the UI.
    console.info(
      '[LOCAL ENQUIRY EMAIL]',
      JSON.stringify(
        {
          to: env.salesEmail,
          subject: `Product enquiry: ${product.title}`,
          product: { id: product.id, title: product.title },
          customer: input,
        },
        null,
        2,
      ),
    );
  }
}

class SmtpEmailProvider implements EmailSender {
  async send(input: EnquiryInput, product: Product): Promise<void> {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPassword) {
      throw new Error('SMTP configuration is incomplete.');
    }

    const transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: { user: env.smtpUser, pass: env.smtpPassword },
    });

    await transport.sendMail({
      from: env.smtpUser,
      to: env.salesEmail,
      replyTo: input.email,
      subject: `Product enquiry: ${product.title}`,
      text: [
        `Product: ${product.title} (ID: ${product.id})`,
        `Customer: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || 'Not provided'}`,
        `Message: ${input.message || 'Not provided'}`,
      ].join('\n'),
    });
    transport.close();
  }
}

export class EmailService implements EmailSender {
  private readonly provider: EmailSender =
    env.emailProvider === 'smtp' ? new SmtpEmailProvider() : new ConsoleEmailProvider();

  send(input: EnquiryInput, product: Product): Promise<void> {
    return this.provider.send(input, product);
  }
}
