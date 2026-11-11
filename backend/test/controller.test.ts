import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { CatalogueController } from '../src/controllers/catalogueController.js';
import { NotFoundError } from '../src/errors/AppError.js';

const product = { id: 2, title: 'Ceramic Bowl', price: 18, description: 'Handmade', category: 'home', image: 'bowl.jpg', rating: { rate: 4.2, count: 4 } };
function appWith(products: Record<string, unknown> = {}, send = vi.fn().mockResolvedValue(undefined)) {
  const service = {
    featured: vi.fn().mockResolvedValue([product]), categories: vi.fn().mockResolvedValue(['home']),
    byCategory: vi.fn().mockResolvedValue({ featured: [product], products: [product] }),
    search: vi.fn().mockResolvedValue([product]), getById: vi.fn().mockResolvedValue(product), ...products,
  };
  return { app: createApp(new CatalogueController(service as never, { send })), service, send };
}

describe('CatalogueController HTTP behavior', () => {
  it('returns featured products, categories and category payload', async () => {
    const { app, service } = appWith();
    await request(app).get('/api/products/featured').expect(200, [product]);
    await request(app).get('/api/categories').expect(200, ['home']);
    await request(app).get('/api/categories/home/products').expect(200, { featured: [product], products: [product] });
    expect(service.byCategory).toHaveBeenCalledWith('home');
  });
  it('rejects missing, blank and overlong search terms', async () => {
    const { app, service } = appWith();
    await request(app).get('/api/products/search').expect(400, { error: 'Enter a search term.' });
    await request(app).get('/api/products/search?q=%20%20').expect(400);
    await request(app).get(`/api/products/search?q=${'a'.repeat(101)}`).expect(400);
    expect(service.search).not.toHaveBeenCalled();
  });
  it('trims search terms before passing them to the service', async () => {
    const { app, service } = appWith();
    await request(app).get('/api/products/search?q=%20bowl%20').expect(200);
    expect(service.search).toHaveBeenCalledWith('bowl');
  });
  it.each(['0', '-1', '1.5', 'abc'])('rejects invalid product id %s', async (id) => {
    const { app, service } = appWith();
    await request(app).get(`/api/products/${id}`).expect(400, { error: 'Invalid product ID.' });
    expect(service.getById).not.toHaveBeenCalled();
  });
  it('returns product details and forwards provider not-found errors', async () => {
    const valid = appWith(); await request(valid.app).get('/api/products/2').expect(200, product);
    const missing = appWith({ getById: vi.fn().mockRejectedValue(new NotFoundError()) });
    await request(missing.app).get('/api/products/999').expect(404);
  });
  it('validates required enquiry fields and their limits', async () => {
    const { app, send } = appWith();
    await request(app).post('/api/enquiries').send({}).expect(400);
    await request(app).post('/api/enquiries').send({ name: 'A', email: 'not-email', productId: 2 }).expect(400);
    await request(app).post('/api/enquiries').send({ name: 'A'.repeat(101), email: 'a@b.com', productId: 2 }).expect(400);
    await request(app).post('/api/enquiries').send({ name: 'Sam', email: 'sam@b.com', message: 'x'.repeat(1001), productId: 2 }).expect(400);
    expect(send).not.toHaveBeenCalled();
  });
  it('accepts valid enquiry, resolves product and invokes email sender', async () => {
    const { app, service, send } = appWith();
    await request(app).post('/api/enquiries').send({ name: ' Sam ', email: ' sam@example.com ', phone: '', message: 'Interested', productId: 2 }).expect(202);
    expect(service.getById).toHaveBeenCalledWith(2);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sam', email: 'sam@example.com' }), product);
  });
  it('does not send enquiry if product lookup fails', async () => {
    const { app, send } = appWith({ getById: vi.fn().mockRejectedValue(new NotFoundError()) });
    await request(app).post('/api/enquiries').send({ name: 'Sam', email: 'sam@example.com', productId: 2 }).expect(404);
    expect(send).not.toHaveBeenCalled();
  });
  it('returns safe 500 response when email provider fails', async () => {
    const { app } = appWith({}, vi.fn().mockRejectedValue(new Error('SMTP secret')));
    await request(app).post('/api/enquiries').send({ name: 'Sam', email: 'sam@example.com', productId: 2 }).expect(500, { error: 'An unexpected error occurred. Please try again.' });
  });
});
