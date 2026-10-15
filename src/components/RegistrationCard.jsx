import { Link } from 'react-router-dom';
import { formatTimestamp, getEventDateParts } from '../utils/format.js';
import CancelRegistrationButton from './CancelRegistrationButton.jsx';

export default function RegistrationCard({ registration, upcoming, onCancel }) {
  const date = getEventDateParts(registration);
  const place = [registration.venueName, registration.city].filter(Boolean).join(', ');

  return (
    <li className={`reg-card${upcoming ? '' : ' reg-card--past'}`}>
      <div className="reg-card__media">
        {registration.image ? <img src={registration.image} alt="" loading="lazy" /> : <div className="event-card__placeholder">No image</div>}
      </div>

      <div className="stub-date stub-date--lg" aria-hidden="true">
        <span className="stub-date__month">{date.month}</span>
        <span className="stub-date__day">{date.day}</span>
      </div>

      <div className="reg-card__info">
        <div className="reg-card__title">
          <h3>
            <Link to={`/events/${registration.eventId}`}>{registration.name}</Link>
          </h3>
          <span className={`tag ${upcoming ? 'tag--upcoming' : 'tag--completed'}`}>{upcoming ? 'Upcoming' : 'Completed'}</span>
        </div>
        <p>{date.full} · {date.time}</p>
        {place && <p className="muted">{place}</p>}
        <p className="muted small">Registered {formatTimestamp(registration.registeredAt)}</p>
      </div>

      <div className="reg-card__actions">
        <Link to={`/events/${registration.eventId}`} className="btn btn--ghost">View details</Link>
        {upcoming && <CancelRegistrationButton onConfirm={onCancel} />}
      </div>
    </li>
  );
}
