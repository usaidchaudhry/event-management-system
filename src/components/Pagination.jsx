export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Show a small window of page numbers around the current page.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <ul>
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className={`pagination__page${p === page ? ' is-current' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
