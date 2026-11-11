import { describe, it, expect, vi } from 'vitest';
import { ProductService } from '../src/services/productService.js';
import type { Product } from '../src/types/product.js';

const make = (id: number, rate: number, title = `Product ${id}`, description = '', category = 'home'): Product => ({
  id, title, price: id, description, category, image: '', rating: { rate, count: id },
});
const repository = (overrides: Record<string, any> = {}) => ({
  getAll: vi.fn().mockResolvedValue([make(1, 2), make(2, 5), make(3, 3), make(4, 4), make(5, 1), make(6, 4.5)]),
  getById: vi.fn().mockImplementation(async (id: number) => make(id, 4)),
  getCategories: vi.fn().mockResolvedValue(['home', 'electronics']),
  getByCategory: vi.fn().mockResolvedValue([make(1, 2), make(2, 5), make(3, 3)]),
  ...overrides,
});

describe('ProductService', () => {
  it('returns exactly five highest-rated products in descending order', async () => {
    const repo = repository();
    const result = await new ProductService(repo as never).featured();
    expect(result.map((p) => p.id)).toEqual([2, 6, 4, 3, 1]);
  });
  it('returns fewer than five when the provider has fewer products', async () => {
    const repo = repository({ getAll: vi.fn().mockResolvedValue([make(1, 3)]) });
    expect((await new ProductService(repo as never).featured()).map((p) => p.id)).toEqual([1]);
  });
  it('treats missing ratings as zero and does not mutate provider order on ties', async () => {
    const items = [make(1, 0), { ...make(2, 0), rating: undefined as never }];
    const repo = repository({ getAll: vi.fn().mockResolvedValue(items) });
    expect((await new ProductService(repo as never).featured()).map((p) => p.id)).toEqual([1, 2]);
    expect(items[0].id).toBe(1);
  });
  it('delegates category and product lookups', async () => {
    const repo = repository(); const service = new ProductService(repo as never);
    expect(await service.categories()).toEqual(['home', 'electronics']);
    expect(repo.getCategories).toHaveBeenCalledOnce();
    expect((await service.getById(7)).id).toBe(7);
    expect(repo.getById).toHaveBeenCalledWith(7);
  });
  it('returns top five category products while retaining the full category list', async () => {
    const repo = repository({ getByCategory: vi.fn().mockResolvedValue([make(1, 2), make(2, 5), make(3, 3), make(4, 4), make(5, 1), make(6, 4.5)]) });
    const result = await new ProductService(repo as never).byCategory('home');
    expect(result.featured.map((p) => p.id)).toEqual([2, 6, 4, 3, 1]);
    expect(result.products).toHaveLength(6);
    expect(repo.getByCategory).toHaveBeenCalledWith('home');
  });
  it.each([
    ['title', 'BLUE MUG', make(1, 4, 'Blue mug')],
    ['description', 'CERAMIC', make(2, 4, 'Cup', 'Ceramic finish')],
    ['category', 'ELECTRONICS', make(3, 4, 'Device', '', 'Electronics')],
  ])('searches %s case-insensitively', async (_field, term, item) => {
    const repo = repository({ getAll: vi.fn().mockResolvedValue([item, make(9, 1, 'Other')]) });
    expect((await new ProductService(repo as never).search(term)).map((p) => p.id)).toEqual([item.id]);
  });
  it('returns no results for a blank search without requesting products', async () => {
    const repo = repository();
    expect(await new ProductService(repo as never).search('  ')).toEqual([]);
    expect(repo.getAll).not.toHaveBeenCalled();
  });
  it('propagates repository failures', async () => {
    const repo = repository({ getAll: vi.fn().mockRejectedValue(new Error('provider down')) });
    await expect(new ProductService(repo as never).featured()).rejects.toThrow('provider down');
  });
});
