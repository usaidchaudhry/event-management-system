import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormField from '../components/FormField.jsx';
import {
  clearAuthError,
  loginUser,
  selectAuthError,
  selectAuthStatus,
} from '../features/auth/authSlice.js';
import { addToast } from '../features/ui/uiSlice.js';
import { validateLogin } from '../utils/validators.js';

export default function Login() {
  const dispatch = useDispatch();
  const location = useLocation();
  const status = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const errors = validateLogin(values);
  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  // Clear any old server error when leaving the page.
  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    if (authError) dispatch(clearAuthError());
  };
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Welcome back, ${result.payload.name}.` }));
    }
  };

  const loading = status === 'loading';

  return (
    <div className="container page page--narrow">
      <div className="panel auth-panel">
        <h1>Log in</h1>
        {location.state?.from && <p className="muted">Log in to continue.</p>}

        <form onSubmit={handleSubmit} noValidate>
          {authError && <p className="form-error" role="alert">{authError}</p>}
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('email')}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('password')}
          />
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-panel__switch">
          Don't have an account? <Link to="/register" state={location.state}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
