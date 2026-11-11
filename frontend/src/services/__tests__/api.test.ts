import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api';

afterEach(() => vi.unstubAllGlobals());
const product = { id: 1, title: 'Vase', price: 10, description: 'Ceramic', category: 'home', image: 'vase.jpg', rating: { rate: 4, count: 2 } };
const ok = (body: unknown) => ({ ok: true, status: 200, json: vi.fn().mockResolvedValue(body) }) as unknown as Response;

describe('frontend API client', () => {
  it('loads featured products', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([product])); vi.stubGlobal('fetch', fetchMock);
    await expect(api.featured()).resolves.toEqual([product]);
    expect(fetchMock).toHaveBeenCalledWith('/api/products/featured', expect.objectContaining({ headers: {} }));
  });
  it('loads categories', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(['home'])));
    await expect(api.categories()).resolves.toEqual(['home']);
  });
  it('URL-encodes category, search term and product id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([])); vi.stubGlobal('fetch', fetchMock);
    await api.category("men's clothing"); await api.search('blue mug & cup'); await api.product('1/2');
    expect(fetchMock.mock.calls[0][0]).toContain('men%27s%20clothing');
    expect(fetchMock.mock.calls[1][0]).toContain('blue%20mug%20%26%20cup');
    expect(fetchMock.mock.calls[2][0]).toBe('/api/products/1%2F2');
  });
  it('posts enquiry JSON with content type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ message: 'Received' })); vi.stubGlobal('fetch', fetchMock);
    await expect(api.enquire({ name: 'Sam', email: 'sam@example.com', productId: 1 })).resolves.toEqual({ message: 'Received' });
    expect(fetchMock).toHaveBeenCalledWith('/api/enquiries', expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Sam', email: 'sam@example.com', productId: 1 }) }));
  });
  it('uses server error messages when response is not successful', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Invalid enquiry' }) }));
    await expect(api.featured()).rejects.toThrow('Invalid enquiry');
  });
  it('uses fallback error for non-JSON error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => { throw new Error('invalid'); } }));
    await expect(api.featured()).rejects.toThrow('Something went wrong. Please try again.');
  });
  it('normalizes network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(api.featured()).rejects.toThrow('Could not connect to the catalogue. Check that the API is running.');
  });
});
