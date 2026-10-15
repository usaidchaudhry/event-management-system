import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EmptyState from '../components/EmptyState.jsx';
import RegistrationCard from '../components/RegistrationCard.jsx';
import { selectUser } from '../features/auth/authSlice.js';
import {
  cancelRegistration,
  selectUserRegistrations,
} from '../features/registrations/registrationsSlice.js';
import { addToast } from '../features/ui/uiSlice.js';
import { isUpcoming } from '../utils/format.js';

const time = (r) => (r.startsAt ? new Date(r.startsAt).getTime() : Number.MAX_SAFE_INTEGER);

export default function MyEvents() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const registrations = useSelector((state) => selectUserRegistrations(state, user.id));
  const [tab, setTab] = useState('upcoming');

  const { upcoming, completed } = useMemo(() => {
    const up = registrations.filter((r) => isUpcoming(r.startsAt)).sort((a, b) => time(a) - time(b));
    const done = registrations.filter((r) => !isUpcoming(r.startsAt)).sort((a, b) => time(b) - time(a));
    return { upcoming: up, completed: done };
  }, [registrations]);

  const handleCancel = (registration) => {
    dispatch(cancelRegistration({ userId: user.id, eventId: registration.eventId }));
    dispatch(addToast({ type: 'info', message: `Your registration for ${registration.name} was cancelled.` }));
  };

  const list = tab === 'upcoming' ? upcoming : completed;

  return (
    <div className="container page">
      <h1>My events</h1>
      <p className="muted">Events you registered for, {user.name.split(' ')[0]}.</p>

      <div className="tabs" role="tablist" aria-label="My events">
        <button
          type="button"
          role="tab"
          id="tab-upcoming"
          aria-selected={tab === 'upcoming'}
          aria-controls="panel-events"
          className={tab === 'upcoming' ? 'is-active' : ''}
          onClick={() => setTab('upcoming')}
        >
          Upcoming <span className="count-pill">{upcoming.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-completed"
          aria-selected={tab === 'completed'}
          aria-controls="panel-events"
          className={tab === 'completed' ? 'is-active' : ''}
          onClick={() => setTab('completed')}
        >
          Completed <span className="count-pill">{completed.length}</span>
        </button>
      </div>

      <div id="panel-events" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {list.length === 0 ? (
          tab === 'upcoming' ? (
            <EmptyState title="No upcoming events yet">
              <p>Register for an event and it will show up here.</p>
              <Link to="/events" className="btn btn--primary">Find an event</Link>
            </EmptyState>
          ) : (
            <EmptyState title="No completed events yet">
              <p>Events you registered for move here once they have taken place.</p>
            </EmptyState>
          )
        ) : (
          <ul className="reg-list">
            {list.map((r) => (
              <RegistrationCard
                key={r.eventId}
                registration={r}
                upcoming={tab === 'upcoming'}
                onCancel={() => handleCancel(r)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
