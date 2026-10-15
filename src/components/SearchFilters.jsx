import DebouncedInput from './DebouncedInput.jsx';

// Countries where Ticketmaster sells tickets (subset supported by the Discovery API).
const COUNTRIES = [
  ['US', 'United States'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['IE', 'Ireland'],
  ['AU', 'Australia'], ['NZ', 'New Zealand'], ['DE', 'Germany'], ['FR', 'France'],
  ['ES', 'Spain'], ['NL', 'Netherlands'], ['MX', 'Mexico'], ['AE', 'United Arab Emirates'],
];

const QUICK_RANGES = [
  ['7', 'Next 7 days'],
  ['30', 'Next 30 days'],
  ['90', 'Next 3 months'],
];

const SORTS = [
  ['', 'Best match'],
  ['date,asc', 'Date: soonest first'],
  ['date,desc', 'Date: latest first'],
  ['name,asc', 'Name: A to Z'],
];

export default function SearchFilters({ filters, categories, onChange, onReset }) {
  const hasFilters = Boolean(
    filters.q || filters.category || filters.country || filters.city || filters.from || filters.to || filters.range || filters.sort,
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="filters__row filters__row--main">
        <div className="field">
          <label htmlFor="f-q">Search</label>
          <DebouncedInput
            id="f-q"
            type="search"
            placeholder="Artist, team, show or venue"
            value={filters.q}
            onCommit={(q) => onChange({ q })}
          />
        </div>

        <div className="field">
          <label htmlFor="f-category">Category</label>
          <select id="f-category" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-sort">Sort by</label>
          <select id="f-sort" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters__row">
        <div className="field">
          <label htmlFor="f-country">Country</label>
          <select id="f-country" value={filters.country} onChange={(e) => onChange({ country: e.target.value })}>
            <option value="">Anywhere</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-city">City</label>
          <DebouncedInput
            id="f-city"
            type="text"
            placeholder="e.g. Chicago"
            value={filters.city}
            onCommit={(city) => onChange({ city })}
          />
        </div>

        <div className="field">
          <label htmlFor="f-from">From</label>
          <input id="f-from" type="date" min={today} value={filters.from} onChange={(e) => onChange({ from: e.target.value })} />
        </div>

        <div className="field">
          <label htmlFor="f-to">To</label>
          <input id="f-to" type="date" min={filters.from || today} value={filters.to} onChange={(e) => onChange({ to: e.target.value })} />
        </div>
      </div>

      <div className="filters__row filters__row--chips">
        <span className="filters__label" id="quick-range-label">Upcoming</span>
        <div className="chips" role="group" aria-labelledby="quick-range-label">
          {QUICK_RANGES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`chip${filters.range === value ? ' is-active' : ''}`}
              aria-pressed={filters.range === value}
              onClick={() => onChange({ range: filters.range === value ? '' : value })}
            >
              {label}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button type="button" className="btn btn--ghost btn--sm filters__reset" onClick={onReset}>
            Clear all filters
          </button>
        )}
      </div>
    </form>
  );
}
