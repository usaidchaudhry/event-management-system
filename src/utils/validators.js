const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateName = (value) => {
  const v = value.trim();
  if (!v) return 'Enter your name.';
  if (v.length < 2) return 'Name must be at least 2 characters.';
  if (v.length > 60) return 'Name must be 60 characters or fewer.';
  return undefined;
};

export const validateEmail = (value) => {
  const v = value.trim();
  if (!v) return 'Enter your email address.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address, like name@example.com.';
  return undefined;
};

export const validatePassword = (value) => {
  if (!value) return 'Enter a password.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password must include at least one letter and one number.';
  return undefined;
};

export const validateConfirm = (password, confirm) => {
  if (!confirm) return 'Re-enter your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return undefined;
};

const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, v]) => v));

export const validateRegistration = ({ name, email, password, confirm }) =>
  compact({
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirm: validateConfirm(password, confirm),
  });

// On login we only check that fields are filled in; the credentials check does the rest.
export const validateLogin = ({ email, password }) =>
  compact({
    email: validateEmail(email),
    password: password ? undefined : 'Enter your password.',
  });
