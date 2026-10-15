import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../features/auth/authSlice.js';
import { selectUserRegistrations } from '../features/registrations/registrationsSlice.js';
import { addToast } from '../features/ui/uiSlice.js';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const registrations = useSelector((state) => selectUserRegistrations(state, user?.id));
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    navigate('/'); // navigate first so the protected page doesn't bounce us to /login
    dispatch(logout());
    dispatch(addToast({ type: 'info', message: 'You have been logged out.' }));
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand__mark" aria-hidden="true" />
          Stubs
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="primary-nav" className={`navbar__nav${open ? ' is-open' : ''}`} aria-label="Primary">
          <NavLink to="/events" onClick={close}>Events</NavLink>
          {user && (
            <NavLink to="/my-events" onClick={close}>
              My events
              {registrations.length > 0 && <span className="count-pill">{registrations.length}</span>}
            </NavLink>
          )}

          <span className="navbar__spacer" />

          {user ? (
            <>
              <span className="navbar__user">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link to="/register" className="btn btn--primary btn--sm" onClick={close}>Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
