import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { api } from '../../services/api';
import Home from '../Home';
import Category from '../Category';
import Search from '../Search';
import Product from '../Product';
import NotFound from '../NotFound';

vi.mock('../../services/api', () => ({ api: { featured: vi.fn(), category: vi.fn(), search: vi.fn(), product: vi.fn(), categories: vi.fn().mockResolvedValue([]), enquire: vi.fn() } }));
const item = (id: number, title = `Product ${id}`) => ({ id, title, price: 20, description: 'Description', category: 'home decor', image: 'item.jpg', rating: { rate: 4.5, count: 8 } });
const mount = (path: string, element: ReactNode) => render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);

beforeEach(() => { vi.mocked(api.featured).mockReset(); vi.mocked(api.category).mockReset(); vi.mocked(api.search).mockReset(); vi.mocked(api.product).mockReset(); vi.mocked(api.enquire).mockReset(); });

describe('catalogue pages', () => {
  it('shows the home loading state and then featured products', async () => {
    vi.mocked(api.featured).mockResolvedValue([item(1)]);
    mount('/', <Home />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('Product 1')).toBeInTheDocument();
    expect(api.featured).toHaveBeenCalledOnce();
  });
  it('shows home API errors', async () => {
    vi.mocked(api.featured).mockRejectedValue(new Error('Catalogue offline'));
    mount('/', <Home />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Catalogue offline');
  });
  it('shows empty featured state', async () => {
    vi.mocked(api.featured).mockResolvedValue([]);
    mount('/', <Home />);
    expect(await screen.findByText('No featured products are available right now.')).toBeInTheDocument();
  });
  it('renders category favourites and excludes them from additional products', async () => {
    vi.mocked(api.category).mockResolvedValue({ featured: [item(1)], products: [item(1), item(2)] });
    mount('/category/home%20decor', <Routes><Route path="/category/:name" element={<Category />} /></Routes>);
    expect(await screen.findByText('Top rated in Home Decor')).toBeInTheDocument();
    expect(screen.getByText('More to discover')).toBeInTheDocument();
    expect(screen.getAllByText('Product 1')).toHaveLength(1);
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(api.category).toHaveBeenCalledWith('home decor');
  });
  it('shows category empty and error states', async () => {
    vi.mocked(api.category).mockResolvedValue({ featured: [], products: [] });
    mount('/category/empty', <Category />);
    expect(await screen.findByText('No products found in this category.')).toBeInTheDocument();
    vi.mocked(api.category).mockRejectedValue(new Error('Category unavailable'));
    mount('/category/broken', <Category />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Category unavailable');
  });
  it('searches using the query string and renders results', async () => {
    vi.mocked(api.search).mockResolvedValue([item(3, 'Blue Mug')]);
    mount('/search?q=blue', <Search />);
    expect(await screen.findByText('Blue Mug')).toBeInTheDocument();
    expect(screen.getByText('1 matching product')).toBeInTheDocument();
    expect(api.search).toHaveBeenCalledWith('blue');
  });
  it('does not call the API for an empty search and shows no matches', async () => {
    mount('/search', <Search />);
    expect(await screen.findByText('No products match your search. Try another term.')).toBeInTheDocument();
    expect(api.search).not.toHaveBeenCalled();
  });
  it('shows search API errors', async () => {
    vi.mocked(api.search).mockRejectedValue(new Error('Search unavailable'));
    mount('/search?q=lamp', <Search />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Search unavailable');
  });
  it('renders product details and opens the enquiry form', async () => {
    vi.mocked(api.product).mockResolvedValue(item(4, 'Stoneware Bowl'));
    mount('/product/4', <Routes><Route path="/product/:id" element={<Product />} /></Routes>);
    expect(await screen.findByRole('heading', { name: 'Stoneware Bowl' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this product' }));
    expect(screen.getByRole('heading', { name: 'Make an enquiry' })).toBeInTheDocument();
    expect(api.product).toHaveBeenCalledWith('4');
  });
  it('submits a valid product enquiry and displays confirmation', async () => {
    vi.mocked(api.product).mockResolvedValue(item(5, 'Oak Tray'));
    vi.mocked(api.enquire).mockResolvedValue({ message: 'Enquiry received' });
    mount('/product/5', <Routes><Route path="/product/:id" element={<Product />} /></Routes>);
    await screen.findByRole('heading', { name: 'Oak Tray' });
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this product' }));
    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Sam Smith' } });
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'sam@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit enquiry' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Enquiry received');
    expect(api.enquire).toHaveBeenCalledWith({ name: 'Sam Smith', email: 'sam@example.com', phone: '', message: '', productId: 5 });
  });
  it('shows enquiry submission errors', async () => {
    vi.mocked(api.product).mockResolvedValue(item(6, 'Desk Lamp'));
    vi.mocked(api.enquire).mockRejectedValue(new Error('Unable to send enquiry'));
    mount('/product/6', <Routes><Route path="/product/:id" element={<Product />} /></Routes>);
    await screen.findByRole('heading', { name: 'Desk Lamp' });
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this product' }));
    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Sam Smith' } });
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'sam@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit enquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to send enquiry');
  });
  it('shows product not-found/error state', async () => {
    vi.mocked(api.product).mockRejectedValue(new Error('Product unavailable'));
    mount('/product/404', <Routes><Route path="/product/:id" element={<Product />} /></Routes>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Product unavailable');
  });
  it('renders the not-found page and home link', () => {
    mount('/missing', <NotFound />);
    expect(screen.getByRole('heading', { name: 'This page wandered off.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the collection' })).toHaveAttribute('href', '/');
  });
});
