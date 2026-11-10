import { env } from '../config/env.js';
import { AppError, NotFoundError } from '../errors/AppError.js';
import type { Product } from '../types/product.js';

/** Data-source boundary. Replace this adapter without changing business logic. */
export interface ProductDataSource {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product>;
  getCategories(): Promise<string[]>;
  getByCategory(category: string): Promise<Product[]>;
}

export class ProductRepository implements ProductDataSource {
  private async request<T>(path: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${env.productApiUrl}${path}`, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown network error';
      throw new AppError(`Product provider is unavailable: ${reason}`, 502);
    }

    if (response.status === 404) throw new NotFoundError();
    if (!response.ok) {
      throw new AppError(`Product provider returned HTTP ${response.status}.`, 502);
    }

    return (await response.json()) as T;
  }

  getAll(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  getById(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  getCategories(): Promise<string[]> {
    return this.request<string[]>('/products/categories');
  }

  getByCategory(category: string): Promise<Product[]> {
    const encodedCategory = encodeURIComponent(category).replace(/'/g, '%27');
    return this.request<Product[]>(`/products/category/${encodedCategory}`);
  }
}
