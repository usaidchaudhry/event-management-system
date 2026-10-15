import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import eventsReducer from '../features/events/eventsSlice.js';
import registrationsReducer from '../features/registrations/registrationsSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import { STORAGE_KEYS, remove, save } from '../utils/storage.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    registrations: registrationsReducer,
    ui: uiReducer,
  },
});

// Persist the login session and registrations to localStorage whenever they change.
// Doing it here (not inside reducers) keeps the reducers pure.
let previousUser = store.getState().auth.user;
let previousRegistrations = store.getState().registrations.byUser;

store.subscribe(() => {
  const { auth, registrations } = store.getState();

  if (auth.user !== previousUser) {
    previousUser = auth.user;
    if (auth.user) save(STORAGE_KEYS.session, auth.user);
    else remove(STORAGE_KEYS.session);
  }

  if (registrations.byUser !== previousRegistrations) {
    previousRegistrations = registrations.byUser;
    save(STORAGE_KEYS.registrations, registrations.byUser);
  }
});

export default store;
