import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return () => { active = false; };
    }
    api.search(query)
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Search could not be completed.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [query]);

  return (
    <section className="content-section page-section">
      <p className="eyebrow">SEARCH THE COLLECTION</p>
      <h1 className="page-title">Results for “{query}”</h1>
      {loading && <Loading label="Searching products…" />}
      {error && <div className="error-panel" role="alert">{error}</div>}
      {!loading && !error && products.length > 0 && (
        <>
          <p className="result-count">{products.length} matching {products.length === 1 ? 'product' : 'products'}</p>
          <div className="product-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="empty-state">No products match your search. Try another term.</p>
      )}
    </section>
  );
}
