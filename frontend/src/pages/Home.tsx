import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.featured()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE CONSIDERED COLLECTION</p>
          <h1>Good design.<br /><i>Better everyday.</i></h1>
          <p>Discover useful, beautifully considered pieces for the way you live.</p>
          <Link className="text-link" to="#featured">Explore the collection <span>↗</span></Link>
        </div>
        <div className="hero-art" aria-label="Editorial still life illustration" role="img">
          <div className="art-sun" />
          <div className="art-vase" />
          <div className="art-arch" />
          <span>CURATED<br />FOR LIVING</span>
        </div>
      </section>

      <section className="content-section" id="featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A FEW GOOD THINGS</p>
            <h2>Top rated</h2>
          </div>
          <span>Five customer favourites, selected by rating</span>
        </div>

        {loading && <Loading label="Finding the customer favourites…" />}
        {error && <div className="error-panel" role="alert">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <p className="empty-state">No featured products are available right now.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </>
  );
}
