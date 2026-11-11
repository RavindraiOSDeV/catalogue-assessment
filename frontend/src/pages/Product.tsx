import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product as ProductType } from '../types';
import Loading from '../components/Loading';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

type EnquiryFields = { name: string; email: string; phone: string; message: string };
const emptyForm: EnquiryFields = { name: '', email: '', phone: '', message: '' };

export default function Product() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [fields, setFields] = useState<EnquiryFields>(emptyForm);
  const [status, setStatus] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.product(id)
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  function updateField(field: keyof EnquiryFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setBusy(true);
    setStatus('');
    setSubmitError('');
    try {
      const result = await api.enquire({ ...fields, productId: product.id });
      setStatus(result.message);
      setFields(emptyForm);
      setFormOpen(false);
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Unable to submit your enquiry.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-section"><Loading label="Loading product details…" /></div>;
  if (error || !product) {
    return (
      <section className="content-section page-section">
        <div className="error-panel" role="alert">{error || 'Product not found.'}</div>
        <Link className="text-link" to="/">Return to the collection</Link>
      </section>
    );
  }

  return (
    <section className="product-detail">
      <div className="detail-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="detail-copy">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.title}</h1>
        <p className="rating">★ {product.rating?.rate?.toFixed(1) ?? '—'} <span>({product.rating?.count ?? 0} reviews)</span></p>
        <strong className="detail-price">{currency.format(product.price)}</strong>
        <p className="description">{product.description}</p>

        <button className="primary-button" type="button" onClick={() => setFormOpen((open) => !open)}>
          {formOpen ? 'Close enquiry form' : 'Enquire about this product'}
        </button>
        {status && <p className="success-message" role="status">{status}</p>}
        {submitError && <p className="error-text" role="alert">{submitError}</p>}

        {formOpen && (
          <form className="enquiry-form" onSubmit={submitEnquiry}>
            <div>
              <p className="eyebrow">LET’S TALK</p>
              <h2>Make an enquiry</h2>
              <p className="form-intro">Share your contact details and our team will follow up.</p>
            </div>
            <label>
              Your name <span>*</span>
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={fields.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>
            <label>
              Email address <span>*</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={fields.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>
            <label>
              Phone number <small>Optional</small>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={fields.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />
            </label>
            <label>
              Message <small>Optional</small>
              <textarea
                name="message"
                rows={3}
                maxLength={1000}
                value={fields.message}
                onChange={(event) => updateField('message', event.target.value)}
              />
            </label>
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit enquiry'}
            </button>
            <p className="privacy-note">Your details will only be used to respond to this enquiry.</p>
          </form>
        )}
      </div>
    </section>
  );
}
