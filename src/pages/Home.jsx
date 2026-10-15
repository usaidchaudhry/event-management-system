import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EventGrid from '../components/EventGrid.jsx';
import SkeletonGrid from '../components/SkeletonGrid.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  fetchCategories,
  fetchUpcomingEvents,
  selectCategories,
  selectUpcoming,
} from '../features/events/eventsSlice.js';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectCategories);
  const upcoming = useSelector(selectUpcoming);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchUpcomingEvents());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/events?q=${encodeURIComponent(q)}` : '/events');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <h1>Find an event. Save your seat.</h1>
          <p>Concerts, games, theatre and more. Register for what you want to attend and keep it all in one list.</p>

          <form className="ticket-search" role="search" onSubmit={handleSearch}>
            <label htmlFor="hero-q" className="visually-hidden">Search events</label>
            <input
              id="hero-q"
              type="search"
              placeholder="Search an artist, team or show"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="container section" aria-labelledby="cat-heading">
        <h2 id="cat-heading">Browse by category</h2>
        {categories.status === 'loading' && categories.items.length === 0 ? (
          <p className="muted">Loading categories…</p>
        ) : (
          <ul className="category-list">
            {categories.items.map((c, i) => (
              <li key={c.id}>
                <Link to={`/events?category=${c.id}`} className={`category-tile category-tile--${i % 5}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="container section" aria-labelledby="upcoming-heading">
        <div className="section__head">
          <h2 id="upcoming-heading">Happening in the next 30 days</h2>
          <Link to="/events?range=30" className="text-link">See all upcoming events</Link>
        </div>

        {upcoming.status === 'failed' ? (
          <ErrorMessage
            title="Couldn't load upcoming events"
            message={upcoming.error}
            onRetry={() => dispatch(fetchUpcomingEvents())}
          />
        ) : (upcoming.status === 'loading' || upcoming.status === 'idle') && upcoming.items.length === 0 ? (
          <SkeletonGrid count={8} />
        ) : upcoming.items.length === 0 ? (
          <EmptyState title="No upcoming events found">
            <p>Try browsing all events instead.</p>
            <Link to="/events" className="btn btn--primary">Browse events</Link>
          </EmptyState>
        ) : (
          <EventGrid events={upcoming.items} />
        )}
      </section>
    </>
  );
}
