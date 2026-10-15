export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
