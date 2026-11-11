import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { CategoryProducts } from '../types';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

export default function Category() {
  const { name = '' } = useParams();
  const category = name;
  const [data, setData] = useState<CategoryProducts>({ featured: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.category(category)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this category.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category]);

  const additionalProducts = useMemo(
    () => data.products.filter((product) => !data.featured.some((featured) => featured.id === product.id)),
    [data],
  );
  const heading = category.replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <section className="content-section page-section">
      <p className="eyebrow">EXPLORE THE COLLECTION</p>
      <h1 className="page-title">{heading}</h1>
      {loading && <Loading label={`Loading ${heading.toLowerCase()}…`} />}
      {error && <div className="error-panel" role="alert">{error}</div>}
      {!loading && !error && data.products.length === 0 && <p className="empty-state">No products found in this category.</p>}
      {!loading && !error && data.products.length > 0 && (
        <>
          <div className="section-heading compact-heading">
            <div><p className="eyebrow">CUSTOMER FAVOURITES</p><h2>Top rated in {heading}</h2></div>
          </div>
          <div className="product-grid">
            {data.featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {additionalProducts.length > 0 && (
            <>
              <div className="section-heading additional-heading">
                <div><p className="eyebrow">THE REST OF THE COLLECTION</p><h2>More to discover</h2></div>
                <span>{additionalProducts.length} more {additionalProducts.length === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="product-grid">
                {additionalProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
