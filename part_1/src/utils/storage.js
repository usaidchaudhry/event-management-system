// Thin, safe wrapper around localStorage (it can throw in private mode or when full).
export const STORAGE_KEYS = {
  users: 'ems.users',
  session: 'ems.session',
  registrations: 'ems.registrations',
};

export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable – the app keeps working for this session */
  }
}

export function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
