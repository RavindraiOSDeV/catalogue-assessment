import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmailService } from '../src/services/emailService.js';
import { env } from '../src/config/env.js';

const product = { id: 1, title: 'Ceramic Vase', price: 10, description: '', category: 'home', image: '', rating: { rate: 4, count: 1 } };
afterEach(() => vi.restoreAllMocks());

describe('EmailService default console provider', () => {
  it('logs a local enquiry without requiring an SMTP account', async () => {
    env.emailProvider = 'console';
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    await expect(new EmailService().send({ name: 'Sam', email: 'sam@example.com', productId: 1 }, product)).resolves.toBeUndefined();
    expect(info).toHaveBeenCalledWith('[LOCAL ENQUIRY EMAIL]', expect.stringContaining('Ceramic Vase'));
    expect(info).toHaveBeenCalledWith('[LOCAL ENQUIRY EMAIL]', expect.stringContaining('sam@example.com'));
  });
});
