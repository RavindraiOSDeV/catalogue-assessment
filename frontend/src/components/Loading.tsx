export default function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-message" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      {label}
    </div>
  );
}
