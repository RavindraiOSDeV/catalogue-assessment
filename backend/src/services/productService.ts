import { ProductRepository } from '../repositories/productRepository.js';
import type { ProductDataSource } from '../repositories/productRepository.js';
import type { Product } from '../types/product.js';

export class ProductService {
  constructor(private readonly repository: ProductDataSource = new ProductRepository()) {}

  async featured(): Promise<Product[]> {
    return (await this.repository.getAll())
      .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
      .slice(0, 5);
  }

  categories(): Promise<string[]> {
    return this.repository.getCategories();
  }

  async byCategory(category: string): Promise<{ featured: Product[]; products: Product[] }> {
    const products = await this.repository.getByCategory(category);
    const featured = [...products]
      .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
      .slice(0, 5);
    return { featured, products };
  }

  async search(term: string): Promise<Product[]> {
    const normalized = term.trim().toLocaleLowerCase();
    if (!normalized) return [];

    const products = await this.repository.getAll();
    return products.filter((product) =>
      `${product.title} ${product.description} ${product.category}`
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }

  getById(id: number): Promise<Product> {
    return this.repository.getById(id);
  }
}
