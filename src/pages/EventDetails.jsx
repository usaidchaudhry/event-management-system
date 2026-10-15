import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import RegistrationPanel from '../components/RegistrationPanel.jsx';
import {
  clearSelectedEvent,
  fetchEventById,
  selectSelectedEvent,
} from '../features/events/eventsSlice.js';
import {
  STATUS_LABELS,
  formatLocation,
  formatPriceRange,
  formatTimestamp,
  getEventDateParts,
} from '../utils/format.js';

export default function EventDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { event, status, error } = useSelector(selectSelectedEvent);

  useEffect(() => {
    const request = dispatch(fetchEventById(id));
    return () => request.abort();
  }, [dispatch, id]);

  useEffect(() => () => { dispatch(clearSelectedEvent()); }, [dispatch]);

  if (status === 'failed') {
    return (
      <div className="container page">
        <ErrorMessage
          title="Couldn't load this event"
          message={error}
          onRetry={() => dispatch(fetchEventById(id))}
        />
        <p><Link to="/events" className="text-link">Back to all events</Link></p>
      </div>
    );
  }

  if (!event || event.id !== id) {
    return (
      <div className="container page">
        <Loader label="Loading event…" />
      </div>
    );
  }

  const date = getEventDateParts(event);
  const price = formatPriceRange(event.priceRanges);
  const location = formatLocation(event.venue);
  const statusLabel = STATUS_LABELS[event.status];
  const problem = ['canceled', 'cancelled', 'postponed', 'rescheduled'].includes(event.status);
  const tags = [event.segment, event.genre, event.subGenre].filter((t, i, arr) => t && t !== 'Undefined' && arr.indexOf(t) === i);

  return (
    <div className="container page">
      <p className="breadcrumb"><Link to="/events">All events</Link> / {event.name}</p>

      <div className="detail-hero">
        {event.bannerImage ? (
          <img src={event.bannerImage} alt={`Promotional artwork for ${event.name}`} />
        ) : (
          <div className="event-card__placeholder">No image available</div>
        )}
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="tag-row">
            {tags.map((t) => <span key={t} className="tag">{t}</span>)}
            {problem && statusLabel && <span className="tag tag--alert">{statusLabel}</span>}
          </div>
          <h1>{event.name}</h1>

          <dl className="facts">
            <div>
              <dt>Date and time</dt>
              <dd>{date.full}<br />{date.time}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>
                {event.venue?.name || 'To be announced'}
                {event.venue?.address && <><br />{event.venue.address}</>}
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>
                {location || 'To be announced'}
                {event.venue?.postalCode && <><br />{event.venue.postalCode}</>}
                {event.venue?.mapUrl && (
                  <><br /><a href={event.venue.mapUrl} target="_blank" rel="noreferrer">View on map</a></>
                )}
              </dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{tags.length ? tags.join(' / ') : 'Not specified'}</dd>
            </div>
            {price && (
              <div>
                <dt>Ticket price</dt>
                <dd>{price}</dd>
              </div>
            )}
            {statusLabel && (
              <div>
                <dt>Status</dt>
                <dd>{statusLabel}</dd>
              </div>
            )}
          </dl>

          {event.info && (
            <section className="detail-section">
              <h2>About this event</h2>
              <p>{event.info}</p>
            </section>
          )}

          {event.pleaseNote && (
            <section className="detail-section">
              <h2>Good to know</h2>
              <p>{event.pleaseNote}</p>
            </section>
          )}

          {event.attractions.length > 0 && (
            <section className="detail-section">
              <h2>Featuring</h2>
              <ul className="attraction-list">
                {event.attractions.map((a) => (
                  <li key={a.id}>
                    {a.image && <img src={a.image} alt="" loading="lazy" />}
                    {a.url ? <a href={a.url} target="_blank" rel="noreferrer">{a.name}</a> : a.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(event.salesStart || event.ageRestriction || event.promoter || event.venue?.parking || event.venue?.accessibility) && (
            <section className="detail-section">
              <h2>More information</h2>
              <ul className="plain-list">
                {event.salesStart && (
                  <li>Public sale: {formatTimestamp(event.salesStart)}{event.salesEnd ? ` to ${formatTimestamp(event.salesEnd)}` : ''}</li>
                )}
                {event.ageRestriction && <li>{event.ageRestriction}</li>}
                {event.promoter && <li>Presented by {event.promoter}</li>}
                {event.venue?.parking && <li>Parking: {event.venue.parking}</li>}
                {event.venue?.accessibility && <li>Accessibility: {event.venue.accessibility}</li>}
              </ul>
            </section>
          )}

          {event.seatmap && (
            <section className="detail-section">
              <h2>Seat map</h2>
              <img className="seatmap" src={event.seatmap} alt={`Seat map for ${event.venue?.name || 'the venue'}`} loading="lazy" />
            </section>
          )}
        </div>

        <div className="detail-side">
          <RegistrationPanel event={event} />
          {event.url && (
            <a className="btn btn--ghost btn--block" href={event.url} target="_blank" rel="noreferrer">
              Buy tickets on Ticketmaster
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
