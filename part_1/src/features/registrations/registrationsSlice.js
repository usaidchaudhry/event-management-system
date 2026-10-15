import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS, load } from '../../utils/storage.js';

const EMPTY = [];

// State shape: { byUser: { [userId]: Registration[] } }
// Each registration stores a snapshot of the event, so "My Events" works without re-calling the API.
const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: { byUser: load(STORAGE_KEYS.registrations, {}) },
  reducers: {
    registerForEvent: {
      reducer(state, action) {
        const { userId, registration } = action.payload;
        const list = state.byUser[userId] || [];
        // Duplicate protection (the UI also hides the button, this is the safety net).
        if (list.some((r) => r.eventId === registration.eventId)) return;
        state.byUser[userId] = [...list, registration];
      },
      prepare({ userId, event }) {
        return {
          payload: {
            userId,
            registration: {
              eventId: event.id,
              name: event.name,
              image: event.image,
              startsAt: event.startsAt,
              localDate: event.localDate,
              localTime: event.localTime,
              segment: event.segment,
              venueName: event.venue?.name || null,
              city: event.venue?.city || null,
              country: event.venue?.country || null,
              registeredAt: new Date().toISOString(),
            },
          },
        };
      },
    },
    cancelRegistration(state, action) {
      const { userId, eventId } = action.payload;
      state.byUser[userId] = (state.byUser[userId] || []).filter((r) => r.eventId !== eventId);
    },
  },
});

export const { registerForEvent, cancelRegistration } = registrationsSlice.actions;

export const selectUserRegistrations = (state, userId) => state.registrations.byUser[userId] ?? EMPTY;
export const selectIsRegistered = (state, userId, eventId) =>
  (state.registrations.byUser[userId] ?? EMPTY).some((r) => r.eventId === eventId);

export default registrationsSlice.reducer;
