import { Link } from 'react-router-dom';
import type { Product } from '../types';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      className="product-card"
      to={`/product/${product.id}`}
      aria-label={`View ${product.title}`}
    >
      <div className="product-image">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="product-meta">
        <span>{product.category}</span>
        <span aria-label={`Rating ${product.rating?.rate ?? 'not available'} out of 5`}>
          ★ {product.rating?.rate?.toFixed(1) ?? '—'}
        </span>
      </div>

      <h3>{product.title}</h3>
      <strong>{currency.format(product.price)}</strong>
    </Link>
  );
}
