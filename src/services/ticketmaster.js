// All communication with the Ticketmaster Discovery API lives in this file.
// Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;

export const PAGE_SIZE = 12;
// The API refuses to page past the 1000th result (size * page must stay < 1000).
const MAX_RESULTS = 1000;
// Free keys are limited to 2 requests/second, so we space requests out.
const MIN_GAP_MS = 550;

// Segments are the top-level categories. Used if the classifications request fails.
export const FALLBACK_CATEGORIES = [
  { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Music' },
  { id: 'KZFzniwnSyZfZ7v7nE', name: 'Sports' },
  { id: 'KZFzniwnSyZfZ7v7na', name: 'Arts & Theatre' },
  { id: 'KZFzniwnSyZfZ7v7nn', name: 'Film' },
  { id: 'KZFzniwnSyZfZ7v7n1', name: 'Miscellaneous' },
];

/* ---------- request plumbing ---------- */

let chain = Promise.resolve();
let lastRequestAt = 0;

const abortError = () => new DOMException('Request aborted', 'AbortError');

function schedule(task, signal) {
  const result = chain.then(async () => {
    if (signal?.aborted) throw abortError();
    const wait = lastRequestAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    if (signal?.aborted) throw abortError();
    lastRequestAt = Date.now();
    return task();
  });
  chain = result.catch(() => undefined);
  return result;
}

function messageForStatus(status) {
  if (status === 401) return 'The Ticketmaster API key was rejected. Check VITE_TICKETMASTER_API_KEY in your .env file.';
  if (status === 404) return 'We could not find that event. It may have been removed.';
  if (status === 429) return 'Too many requests to Ticketmaster. Wait a few seconds and try again.';
  if (status >= 500) return 'Ticketmaster is having trouble right now. Try again in a moment.';
  return `Ticketmaster returned an unexpected error (${status}).`;
}

async function request(path, params = {}, signal) {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key is missing. Add VITE_TICKETMASTER_API_KEY to your .env file and restart the dev server.');
  }
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('apikey', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  let response;
  try {
    response = await schedule(() => fetch(url, { signal }), signal);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Network error. Check your internet connection and try again.');
  }
  if (!response.ok) throw new Error(messageForStatus(response.status));
  return response.json();
}

/* ---------- helpers ---------- */

const toApiDate = (date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');
const addDays = (date, days) => new Date(date.getTime() + days * 86_400_000);

function pickImage(images = [], ratio = '16_9', minWidth = 640) {
  const sameRatio = images.filter((img) => img.ratio === ratio);
  const pool = [...(sameRatio.length ? sameRatio : images)];
  if (!pool.length) return null;
  const bigEnough = pool.filter((img) => img.width >= minWidth).sort((a, b) => a.width - b.width);
  return (bigEnough[0] || pool.sort((a, b) => b.width - a.width)[0]).url;
}

// Turns the raw (deeply nested) API event into a flat object the UI can use.
export function mapEvent(raw) {
  const venue = raw._embedded?.venues?.[0];
  const classification = raw.classifications?.find((c) => c.primary) || raw.classifications?.[0];
  const start = raw.dates?.start || {};
  const startsAt = start.dateTime || (start.localDate ? `${start.localDate}T${start.localTime || '23:59:59'}` : null);
  const lat = venue?.location?.latitude;
  const lng = venue?.location?.longitude;

  return {
    id: raw.id,
    name: raw.name,
    url: raw.url,
    image: pickImage(raw.images),
    bannerImage: pickImage(raw.images, '16_9', 1024),
    startsAt,
    localDate: start.localDate || null,
    localTime: start.localTime || null,
    timezone: raw.dates?.timezone || null,
    status: raw.dates?.status?.code || null,
    segment: classification?.segment?.name || null,
    genre: classification?.genre?.name || null,
    subGenre: classification?.subGenre?.name || null,
    info: raw.info || null,
    pleaseNote: raw.pleaseNote || null,
    ageRestriction: raw.ageRestrictions?.legalAgeEnforced ? 'Age restrictions apply' : null,
    promoter: raw.promoter?.name || null,
    priceRanges: raw.priceRanges || [],
    salesStart: raw.sales?.public?.startDateTime || null,
    salesEnd: raw.sales?.public?.endDateTime || null,
    seatmap: raw.seatmap?.staticUrl || null,
    attractions: (raw._embedded?.attractions || []).map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      image: pickImage(a.images, '3_2', 300),
    })),
    venue: venue
      ? {
          name: venue.name,
          address: venue.address?.line1 || null,
          city: venue.city?.name || null,
          state: venue.state?.name || venue.state?.stateCode || null,
          country: venue.country?.name || null,
          postalCode: venue.postalCode || null,
          parking: venue.parkingDetail || null,
          accessibility: venue.accessibleSeatingDetail || null,
          mapUrl: lat && lng
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue.name, venue.city?.name].filter(Boolean).join(' '))}`,
        }
      : null,
  };
}

// Converts UI filters into Discovery API query parameters.
export function buildEventQuery(filters = {}, size = PAGE_SIZE) {
  const { q, category, country, city, from, to, range, sort, page = 1 } = filters;
  const now = new Date();
  let startDateTime = toApiDate(now); // never show events that already happened
  let endDateTime;

  if (range) endDateTime = toApiDate(addDays(now, Number(range)));
  if (from) startDateTime = `${from}T00:00:00Z`;
  if (to) endDateTime = `${to}T23:59:59Z`;

  return {
    keyword: q,
    segmentId: category,
    countryCode: country,
    city,
    startDateTime,
    endDateTime,
    sort: sort || (q ? 'relevance,desc' : 'date,asc'),
    size,
    page: Math.max(0, Number(page) - 1),
    includeTBA: 'no',
    includeTest: 'no',
  };
}

/* ---------- endpoints ---------- */

export async function searchEvents(filters, signal, size = PAGE_SIZE) {
  const data = await request('/events.json', buildEventQuery(filters, size), signal);
  const events = (data._embedded?.events || []).map(mapEvent);
  const page = data.page || {};
  const reachable = Math.floor(MAX_RESULTS / size);
  return {
    events,
    page: {
      number: (page.number ?? 0) + 1,
      size: page.size ?? size,
      totalElements: page.totalElements ?? events.length,
      totalPages: Math.min(page.totalPages ?? 1, reachable),
    },
  };
}

export async function getEvent(id, signal) {
  const data = await request(`/events/${encodeURIComponent(id)}.json`, {}, signal);
  return mapEvent(data);
}

export async function getCategories(signal) {
  const data = await request('/classifications.json', { size: 100 }, signal);
  const seen = new Map();
  (data._embedded?.classifications || []).forEach((c) => {
    if (c.segment?.id && !seen.has(c.segment.id)) seen.set(c.segment.id, { id: c.segment.id, name: c.segment.name });
  });
  const list = [...seen.values()].filter((c) => c.name && c.name.toLowerCase() !== 'undefined');
  return list.length ? list : FALLBACK_CATEGORIES;
}
