import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../Layout';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({ api: { categories: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.categories).mockResolvedValue(['electronics', 'men clothing']);
});

describe('Layout', () => {
  it('loads category navigation and renders the nested page', async () => {
    render(<MemoryRouter><Routes><Route element={<Layout />}><Route path="*" element={<h1>Page content</h1>} /></Route></Routes></MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'Electronics' })).toHaveAttribute('href', '/category/electronics');
    expect(screen.getByRole('link', { name: 'Men Clothing' })).toHaveAttribute('href', '/category/men%20clothing');
    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument();
    expect(api.categories).toHaveBeenCalledOnce();
  });
  it('submits trimmed search terms to the search route', () => {
    render(<MemoryRouter><Routes><Route element={<Layout />}><Route path="*" element={<div>Catalogue page</div>} /><Route path="/search" element={<div>Search destination</div>} /></Route></Routes></MemoryRouter>);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search products' }), { target: { value: '  blue mug  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit search' }));
    expect(screen.getByText('Search destination')).toBeInTheDocument();
  });
  it('does not navigate for an empty search', () => {
    render(<MemoryRouter><Layout /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Submit search' }));
    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});
