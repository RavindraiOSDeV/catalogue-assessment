import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="content-section page-section not-found">
      <p className="eyebrow">404 — PAGE NOT FOUND</p>
      <h1 className="page-title">This page wandered off.</h1>
      <p>The page you are looking for may have moved or no longer exists.</p>
      <Link className="primary-button button-link" to="/">Back to the collection</Link>
    </section>
  );
}
