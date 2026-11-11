import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { NextFunction, Request, Response } from 'express';
import { createApp } from '../src/app.js';
import { AppError, NotFoundError } from '../src/errors/AppError.js';

const product = { id: 1, title: 'Test vase', price: 12, description: 'A vase', category: 'home', image: 'image.jpg', rating: { rate: 4.5, count: 10 } };
function setup() {
  const controller = {
    featured: vi.fn((_req: Request, res: Response) => res.json([product])),
    categories: vi.fn((_req: Request, res: Response) => res.json(['home'])),
    category: vi.fn((req: Request, res: Response) => res.json({ featured: [product], products: [product], requested: req.params.name })),
    search: vi.fn((req: Request, res: Response) => req.query.q ? res.json([product]) : res.status(400).json({ error: 'Enter a search term.' })),
    product: vi.fn((req: Request, res: Response) => req.params.id === '1' ? res.json(product) : res.status(404).json({ error: 'The requested product was not found.' })),
    enquiry: vi.fn((req: Request, res: Response) => req.body?.name ? res.status(202).json({ message: 'Thank you. Your enquiry has been submitted.' }) : res.status(400).json({ error: 'Please check the enquiry details and try again.' })),
  };
  return { app: createApp(controller as never), controller };
}

describe('HTTP application', () => {
  it('serves health and disables the powered-by header', async () => {
    const { app } = setup(); const result = await request(app).get('/health').expect(200);
    expect(result.body).toEqual({ status: 'ok' }); expect(result.headers['x-powered-by']).toBeUndefined();
  });
  it('routes featured products and categories', async () => {
    const { app } = setup();
    expect((await request(app).get('/api/products/featured').expect(200)).body).toHaveLength(1);
    expect((await request(app).get('/api/categories').expect(200)).body).toEqual(['home']);
  });
  it('routes category names containing encoded characters', async () => {
    const { app } = setup();
    expect((await request(app).get('/api/categories/men%27s%20clothing/products').expect(200)).body.requested).toBe("men's clothing");
  });
  it('routes search and product detail requests', async () => {
    const { app } = setup();
    await request(app).get('/api/products/search?q=vase').expect(200);
    await request(app).get('/api/products/1').expect(200);
  });
  it('routes enquiry submissions', async () => {
    const { app } = setup();
    await request(app).post('/api/enquiries').send({ name: 'Sam' }).expect(202);
  });
  it('returns JSON 404 for unknown routes', async () => {
    const { app } = setup();
    expect((await request(app).get('/missing').expect(404)).body).toEqual({ error: 'Route not found.' });
  });
  it('returns a safe error response for malformed JSON', async () => {
    const { app } = setup();
    await request(app).post('/api/enquiries').set('Content-Type', 'application/json').send('{bad').expect(400, { error: 'Request body must contain valid JSON.' });
  });
  it('normalizes AppError responses and hides internal 5xx details', async () => {
    const { app, controller } = setup();
    const errorApp = createApp({ ...controller, featured: (_req: Request, _res: Response, next: NextFunction) => next(new AppError('secret detail', 503)) } as never);
    await request(errorApp).get('/api/products/featured').expect(503, { error: 'The service is temporarily unavailable. Please try again.' });
    expect(app).toBeDefined();
  });
  it('handles NotFoundError as a 404', async () => {
    const { controller } = setup();
    const app = createApp({ ...controller, product: (_req: Request, _res: Response, next: NextFunction) => next(new NotFoundError()) } as never);
    await request(app).get('/api/products/100').expect(404, { error: 'The requested product was not found.' });
  });
});
