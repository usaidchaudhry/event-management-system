import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SearchFilters from '../components/SearchFilters.jsx';
import EventGrid from '../components/EventGrid.jsx';
import SkeletonGrid from '../components/SkeletonGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  fetchCategories,
  fetchEvents,
  selectCategories,
  selectEventList,
} from '../features/events/eventsSlice.js';

// The URL is the source of truth for filters, so searches can be bookmarked, shared and
// the browser's back button works.
const FILTER_KEYS = ['q', 'category', 'country', 'city', 'from', 'to', 'range', 'sort'];

function paramsToFilters(params) {
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) || '']));
  filters.page = Math.max(1, Number(params.get('page')) || 1);
  return filters;
}

export default function Events() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { items, page, status, error } = useSelector(selectEventList);
  const categories = useSelector(selectCategories);

  const filters = useMemo(() => paramsToFilters(params), [params]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const load = useCallback(() => dispatch(fetchEvents(filters)), [dispatch, filters]);

  useEffect(() => {
    const request = load();
    return () => request.abort(); // cancel if the filters change before it finishes
  }, [load]);

  const updateParams = (next) => {
    const clean = {};
    Object.entries(next).forEach(([key, value]) => {
      if (value && !(key === 'page' && value === 1)) clean[key] = String(value);
    });
    setParams(clean);
  };

  const handleChange = (patch) => {
    const next = { ...filters, ...patch, page: 1 };
    // A quick range and a custom date range are mutually exclusive.
    if ('range' in patch && patch.range) { next.from = ''; next.to = ''; }
    if (('from' in patch && patch.from) || ('to' in patch && patch.to)) next.range = '';
    updateParams(next);
  };

  const handlePageChange = (nextPage) => {
    updateParams({ ...filters, page: nextPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loading = status === 'loading' || status === 'idle';

  return (
    <div className="container page">
      <h1>Events</h1>

      <SearchFilters
        filters={filters}
        categories={categories.items}
        onChange={handleChange}
        onReset={() => setParams({})}
      />

      <section aria-live="polite" aria-busy={loading}>
        {!loading && status === 'succeeded' && (
          <p className="results-count">
            {page.totalElements.toLocaleString()} {page.totalElements === 1 ? 'event' : 'events'} found
            {page.totalPages > 1 && ` · page ${page.number} of ${page.totalPages}`}
          </p>
        )}

        {loading ? (
          <SkeletonGrid count={8} />
        ) : status === 'failed' ? (
          <ErrorMessage title="Couldn't load events" message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState title="No events match your search">
            <p>Try a different keyword, widen the dates, or clear the filters.</p>
            <button type="button" className="btn btn--primary" onClick={() => setParams({})}>Clear all filters</button>
          </EmptyState>
        ) : (
          <>
            <EventGrid events={items} />
            <Pagination page={page.number} totalPages={page.totalPages} onChange={handlePageChange} />
          </>
        )}
      </section>
    </div>
  );
}
