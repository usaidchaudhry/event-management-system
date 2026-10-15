import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../../services/ticketmaster.js';

export const fetchEvents = createAsyncThunk('events/fetchEvents', (filters, { signal }) =>
  api.searchEvents(filters, signal),
);

// "Upcoming" = the next 30 days, soonest first. Used on the home page.
export const fetchUpcomingEvents = createAsyncThunk('events/fetchUpcoming', (_, { signal }) =>
  api.searchEvents({ range: 30, page: 1 }, signal, 8),
);

export const fetchEventById = createAsyncThunk('events/fetchEventById', (id, { signal }) =>
  api.getEvent(id, signal),
);

export const fetchCategories = createAsyncThunk('events/fetchCategories', (_, { signal }) => api.getCategories(signal), {
  // Categories rarely change, so only load them once.
  condition: (_, { getState }) => {
    const { status } = getState().events.categories;
    return status !== 'loading' && status !== 'succeeded';
  },
});

const initialState = {
  list: { items: [], page: { number: 1, size: api.PAGE_SIZE, totalElements: 0, totalPages: 0 }, status: 'idle', error: null, requestId: null },
  upcoming: { items: [], status: 'idle', error: null },
  selected: { event: null, status: 'idle', error: null, requestId: null },
  categories: { items: [], status: 'idle', error: null },
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelectedEvent(state) {
      state.selected = initialState.selected;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ----- search results ----- */
      .addCase(fetchEvents.pending, (state, action) => {
        state.list.status = 'loading';
        state.list.error = null;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return; // a newer search replaced this one
        state.list.status = 'succeeded';
        state.list.items = action.payload.events;
        state.list.page = action.payload.page;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.meta.aborted || state.list.requestId !== action.meta.requestId) return;
        state.list.status = 'failed';
        state.list.items = [];
        state.list.error = action.error.message;
      })

      /* ----- upcoming (home page) ----- */
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.upcoming.status = 'loading';
        state.upcoming.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.upcoming.status = 'succeeded';
        state.upcoming.items = action.payload.events;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.upcoming.status = 'failed';
        state.upcoming.error = action.error.message;
      })

      /* ----- single event ----- */
      .addCase(fetchEventById.pending, (state, action) => {
        state.selected.status = 'loading';
        state.selected.error = null;
        state.selected.event = null;
        state.selected.requestId = action.meta.requestId;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        if (state.selected.requestId !== action.meta.requestId) return;
        state.selected.status = 'succeeded';
        state.selected.event = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        if (action.meta.aborted || state.selected.requestId !== action.meta.requestId) return;
        state.selected.status = 'failed';
        state.selected.error = action.error.message;
      })

      /* ----- categories ----- */
      .addCase(fetchCategories.pending, (state) => {
        state.categories.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.status = 'succeeded';
        state.categories.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        // Fall back to the built-in segment list so filters still work.
        state.categories.status = 'succeeded';
        state.categories.items = api.FALLBACK_CATEGORIES;
      });
  },
});

export const { clearSelectedEvent } = eventsSlice.actions;

export const selectEventList = (state) => state.events.list;
export const selectUpcoming = (state) => state.events.upcoming;
export const selectSelectedEvent = (state) => state.events.selected;
export const selectCategories = (state) => state.events.categories;

export default eventsSlice.reducer;
