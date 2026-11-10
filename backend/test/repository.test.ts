import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductRepository } from '../src/repositories/productRepository.js';
import { AppError, NotFoundError } from '../src/errors/AppError.js';

afterEach(() => vi.unstubAllGlobals());
const response = (status: number, body: unknown = []) => ({ status, ok: status >= 200 && status < 300, json: vi.fn().mockResolvedValue(body) }) as unknown as Response;

describe('ProductRepository', () => {
  it('requests the all-products endpoint with JSON headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, [{ id: 1 }])); vi.stubGlobal('fetch', fetchMock);
    await expect(new ProductRepository().getAll()).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/products$/), expect.objectContaining({ headers: { Accept: 'application/json' } }));
  });
  it('encodes category names in the provider URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, [])); vi.stubGlobal('fetch', fetchMock);
    await new ProductRepository().getByCategory("men's clothing");
    expect(fetchMock.mock.calls[0][0]).toContain('men%27s%20clothing');
  });
  it('maps provider 404 to NotFoundError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(404)));
    await expect(new ProductRepository().getById(999)).rejects.toBeInstanceOf(NotFoundError);
  });
  it('maps provider HTTP errors to 502 AppError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(503)));
    await expect(new ProductRepository().getAll()).rejects.toMatchObject({ statusCode: 502 });
  });
  it('maps network failures to 502 AppError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(new ProductRepository().getAll()).rejects.toBeInstanceOf(AppError);
    await expect(new ProductRepository().getAll()).rejects.toThrow(/unavailable/);
  });
  it('propagates malformed JSON errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true, json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) }));
    await expect(new ProductRepository().getAll()).rejects.toThrow('bad json');
  });
});
