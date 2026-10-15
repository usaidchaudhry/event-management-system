import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice.js';
import { selectIsRegistered } from '../features/registrations/registrationsSlice.js';
import { STATUS_LABELS, formatLocation, formatPriceRange, getEventDateParts } from '../utils/format.js';

export default function EventCard({ event }) {
  const user = useSelector(selectUser);
  const registered = useSelector((state) => selectIsRegistered(state, user?.id, event.id));
  const date = getEventDateParts(event);
  const price = formatPriceRange(event.priceRanges);
  const location = formatLocation(event.venue);
  const unavailable = ['canceled', 'cancelled', 'postponed'].includes(event.status);

  return (
    <article className="event-card">
      <Link to={`/events/${event.id}`} className="event-card__link" aria-label={`${event.name}, ${date.full}`}>
        <div className="event-card__media">
          {event.image ? (
            <img src={event.image} alt="" loading="lazy" />
          ) : (
            <div className="event-card__placeholder">No image</div>
          )}
          {event.segment && <span className="tag tag--on-image">{event.segment}</span>}
          {registered && <span className="tag tag--registered">Registered</span>}
        </div>

        <div className="event-card__body">
          <div className="stub-date" aria-hidden="true">
            <span className="stub-date__month">{date.month}</span>
            <span className="stub-date__day">{date.day}</span>
          </div>
          <div className="event-card__info">
            <h3>{event.name}</h3>
            <p className="muted">{event.venue?.name || 'Venue to be announced'}</p>
            {location && <p className="muted">{location}</p>}
            <p className="event-card__meta">
              <span>{date.weekday ? `${date.weekday}, ${date.time}` : date.time}</span>
              {price && <span>{price}</span>}
            </p>
            {unavailable && <p className="event-card__alert">{STATUS_LABELS[event.status]}</p>}
          </div>
        </div>
      </Link>
    </article>
  );
}
