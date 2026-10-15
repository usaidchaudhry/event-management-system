import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormField from '../components/FormField.jsx';
import {
  clearAuthError,
  registerUser,
  selectAuthError,
  selectAuthStatus,
} from '../features/auth/authSlice.js';
import { addToast } from '../features/ui/uiSlice.js';
import { validateRegistration } from '../utils/validators.js';

export default function Register() {
  const dispatch = useDispatch();
  const location = useLocation();
  const status = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const errors = validateRegistration(values);
  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    if (authError) dispatch(clearAuthError());
  };
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (Object.keys(errors).length > 0) return;
    const result = await dispatch(
      registerUser({ name: values.name, email: values.email, password: values.password }),
    );
    if (registerUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Account created. Welcome, ${result.payload.name}!` }));
    }
  };

  const loading = status === 'loading';

  return (
    <div className="container page page--narrow">
      <div className="panel auth-panel">
        <h1>Create your account</h1>
        <p className="muted">It takes under a minute. Your details stay in this browser.</p>

        <form onSubmit={handleSubmit} noValidate>
          {authError && <p className="form-error" role="alert">{authError}</p>}
          <FormField
            id="name"
            label="Full name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('name')}
          />
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
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number."
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('password')}
          />
          <FormField
            id="confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError('confirm')}
          />
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-panel__switch">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
