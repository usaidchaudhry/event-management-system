import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice.js';
import {
  cancelRegistration,
  registerForEvent,
  selectIsRegistered,
} from '../features/registrations/registrationsSlice.js';
import { addToast } from '../features/ui/uiSlice.js';
import { isUpcoming } from '../utils/format.js';
import CancelRegistrationButton from './CancelRegistrationButton.jsx';

export default function RegistrationPanel({ event }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const registered = useSelector((state) => selectIsRegistered(state, user?.id, event.id));

  const upcoming = isUpcoming(event.startsAt);
  const cancelled = ['canceled', 'cancelled'].includes(event.status);

  const handleRegister = () => {
    if (registered) {
      dispatch(addToast({ type: 'info', message: 'You are already registered for this event.' }));
      return;
    }
    dispatch(registerForEvent({ userId: user.id, event }));
    dispatch(addToast({ type: 'success', message: `You're registered for ${event.name}.` }));
  };

  const handleCancel = () => {
    dispatch(cancelRegistration({ userId: user.id, eventId: event.id }));
    dispatch(addToast({ type: 'info', message: `Your registration for ${event.name} was cancelled.` }));
  };

  let content;
  if (!user) {
    content = (
      <>
        <p>Log in to register for this event and keep it in your list.</p>
        <Link to="/login" state={{ from: location }} className="btn btn--primary btn--block">Log in to register</Link>
        <p className="muted small">
          New here? <Link to="/register" state={{ from: location }}>Create an account</Link>
        </p>
      </>
    );
  } else if (registered) {
    content = (
      <>
        <p className="registered-note"><strong>You're registered.</strong> Find this event under My events.</p>
        {upcoming ? (
          <CancelRegistrationButton onConfirm={handleCancel} />
        ) : (
          <p className="muted small">This event has finished, so the registration can no longer be cancelled.</p>
        )}
        <Link to="/my-events" className="btn btn--ghost btn--block">View my events</Link>
      </>
    );
  } else if (cancelled) {
    content = <p>This event was cancelled, so registration is closed.</p>;
  } else if (!upcoming) {
    content = <p>This event has already taken place, so registration is closed.</p>;
  } else {
    content = (
      <>
        <p>Save your spot. You can cancel any time before the event.</p>
        <button type="button" className="btn btn--primary btn--block" onClick={handleRegister}>
          Register for this event
        </button>
      </>
    );
  }

  return (
    <aside className="panel registration-panel" aria-label="Registration">
      <h2>Registration</h2>
      {content}
    </aside>
  );
}
