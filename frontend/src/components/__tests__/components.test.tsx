import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Loading from '../Loading';
import ProductCard from '../ProductCard';

const product = { id: 7, title: 'Handmade Vase', price: 25.5, description: 'A vase', category: 'home decor', image: 'vase.jpg', rating: { rate: 4.25, count: 12 } };

describe('shared components', () => {
  it('renders the default loading label accessibly', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });
  it('renders a custom loading label', () => {
    render(<Loading label="Loading products" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
  });
  it('renders product details and links to its detail route', () => {
    render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'View Handmade Vase' })).toHaveAttribute('href', '/product/7');
    expect(screen.getByRole('img', { name: 'Handmade Vase' })).toHaveAttribute('src', 'vase.jpg');
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating 4.25 out of 5')).toBeInTheDocument();
  });
  it('hides a product image when the image request fails', () => {
    render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
    const image = screen.getByRole('img', { name: 'Handmade Vase' });
    fireEvent.error(image);
    expect(image).toHaveStyle({ display: 'none' });
  });
});
