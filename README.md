# Stubs — Event Management System

A React single-page app for exploring live events from the **Ticketmaster Discovery API**, registering for them, and managing your registrations.

Built for *Web Programming – Assignment 2* with **React, Redux Toolkit and React Router**.

## Features

- **Authentication (frontend simulation):** register, log in, log out. Session and users persist in `localStorage`, so a page refresh keeps you logged in. Passwords are salted and hashed (SHA-256) – never stored in plain text.
- **Event exploration:** keyword search, category filter, country, city, date range, "next 7 / 30 / 90 days" quick filters, sorting, and pagination. Filters live in the URL, so searches can be bookmarked and the back button works.
- **Categories:** browse by Ticketmaster segment (Music, Sports, Arts & Theatre, Film, Miscellaneous) from the home page.
- **Event details:** name, date/time, venue, location (with map link), category/genre, image, price range, description, notes, performers, sale dates, seat map and a link to buy tickets.
- **Registration:** logged-in users can register for an event, duplicates are prevented, feedback is shown with toast messages, and registrations can be cancelled (with a confirmation step). Registrations are stored per user.
- **My Events:** registered events split into **Upcoming** and **Completed**. Only upcoming registrations can be cancelled.
- **Protected routes:** `/my-events` needs login; `/login` and `/register` redirect logged-in users away. After logging in you return to the page you were trying to reach.
- **UX:** loading skeletons, error states with retry, empty states, form validation, responsive layout, keyboard-accessible controls.

## Tech stack

| Area | Tool |
| --- | --- |
| UI | React 18 + Vite |
| State | Redux Toolkit (`configureStore`, `createSlice`, `createAsyncThunk`) + React-Redux (`useSelector`, `useDispatch`) |
| Routing | React Router v6 |
| Data | Ticketmaster Discovery API v2 |

## Redux structure

| Slice | Responsibility |
| --- | --- |
| `auth` | Current user, login/register status and errors (thunks `registerUser`, `loginUser`; reducers `logout`, `clearAuthError`) |
| `events` | Search results + pagination, upcoming events, selected event, categories (thunks `fetchEvents`, `fetchUpcomingEvents`, `fetchEventById`, `fetchCategories`) |
| `registrations` | `byUser[userId]` list of registrations (reducers `registerForEvent`, `cancelRegistration`) |
| `ui` | Toast notifications |

`src/app/store.js` subscribes to the store and persists the session and registrations to `localStorage`.

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home (search, categories, upcoming) | Public |
| `/events` | Search & filter events | Public |
| `/events/:id` | Event details + registration | Public (register needs login) |
| `/login`, `/register` | Auth forms | Logged-out only |
| `/my-events` | My registered events | Logged-in only |

## Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
- A free Ticketmaster API key

### 2. Get an API key
1. Create an account at <https://developer.ticketmaster.com/>.
2. Open **My Apps** and copy the **Consumer Key** – that is your API key.

### 3. Install and configure
```bash
git clone https://github.com/<your-username>/event-management-system.git
cd event-management-system
npm install
cp .env.example .env        # on Windows PowerShell: copy .env.example .env
```
Open `.env` and paste your key:
```
VITE_TICKETMASTER_API_KEY=your_consumer_key_here
```
> `.env` is git-ignored. **Never commit your real key.**

### 4. Run
```bash
npm run dev       # development server, usually http://localhost:5173
npm run build     # production build in /dist
npm run preview   # preview the production build
```
Restart the dev server after changing `.env`.

## Project structure
```
src/
├── app/store.js                  # configureStore + localStorage persistence
├── features/
│   ├── auth/authSlice.js
│   ├── events/eventsSlice.js
│   ├── registrations/registrationsSlice.js
│   └── ui/uiSlice.js
├── services/
│   ├── ticketmaster.js           # all API calls, throttling, response mapping
│   └── userStore.js              # localStorage "user database" + password hashing
├── components/                   # reusable UI (EventCard, SearchFilters, Navbar, ...)
├── pages/                        # route-level screens
├── utils/                        # formatting, validation, storage helpers
├── App.jsx                       # route table
└── main.jsx                      # Provider + BrowserRouter
```

## Notes and limitations
- Authentication is a **simulation** (no backend). Do not use real passwords.
- Registrations are an in-app feature; they do not buy tickets. Use the "Buy tickets on Ticketmaster" link for that.
- The free Ticketmaster key allows 5,000 requests/day and 2 requests/second. The API service spaces requests out automatically, and search input is debounced.
- Vite exposes `VITE_*` variables in the browser bundle. That is fine for this assignment (the key is not in Git), but a production app would call the API through a backend.
- Ticketmaster only covers some countries, so leaving the country filter on "Anywhere" gives the broadest results.
