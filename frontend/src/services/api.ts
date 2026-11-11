import type { CategoryProducts, Product } from '../types';

// Relative URL is intentional. Vite proxies /api to Node during development,
// which also makes the same setup work from iPhone Safari over local Wi-Fi.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

type Enquiry = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  productId: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error('Could not connect to the catalogue. Check that the API is running.');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Something went wrong. Please try again.');
  }
  return body as T;
}

export const api = {
  featured: () => request<Product[]>('/products/featured'),
  categories: () => request<string[]>('/categories'),
  category: (name: string) =>
    request<CategoryProducts>(`/categories/${encodeURIComponent(name).replace(/'/g, '%27')}/products`),
  search: (term: string) => request<Product[]>(`/products/search?q=${encodeURIComponent(term)}`),
  product: (id: string) => request<Product>(`/products/${encodeURIComponent(id)}`),
  enquire: (data: Enquiry) =>
    request<{ message: string }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
