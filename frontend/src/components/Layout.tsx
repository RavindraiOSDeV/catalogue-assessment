import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';

function formatCategory(category: string): string {
  return category.replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function Layout() {
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.categories()
      .then((result) => {
        if (active) setCategories(result);
      })
      .catch(() => {
        // Category navigation is supplementary; the main page still works.
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Form and Found home">
          FORM <i>&</i> FOUND
          <span>OBJECTS FOR EVERYDAY LIVING</span>
        </Link>

        <form className="search-form" onSubmit={submitSearch} role="search">
          <label className="visually-hidden" htmlFor="catalogue-search">Search products</label>
          <input
            id="catalogue-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search the collection…"
            maxLength={100}
          />
          <button type="submit" aria-label="Submit search">⌕</button>
        </form>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <a href="#categories">Categories</a>
        </nav>
      </header>

      <nav className="category-nav" id="categories" aria-label="Product categories">
        {categories.map((category) => (
          <Link key={category} to={`/category/${encodeURIComponent(category)}`}>
            {formatCategory(category)}
          </Link>
        ))}
      </nav>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <strong>FORM & FOUND</strong>
        <span>Thoughtful objects. Everyday essentials.</span>
      </footer>
    </>
  );
}
