const TIME_TBA = 'Time TBA';

// Ticketmaster gives the venue's local date/time. We build a Date from those parts
// (no timezone conversion) so users see the same time printed on the ticket.
function localDateObject(event) {
  if (!event?.localDate) return null;
  const [y, m, d] = event.localDate.split('-').map(Number);
  const [hh = 0, mm = 0] = (event.localTime || '00:00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function getEventDateParts(event) {
  const date = localDateObject(event);
  if (!date) {
    return { month: 'TBA', day: '–', weekday: '', full: 'Date to be announced', time: TIME_TBA, short: 'Date TBA' };
  }
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
  const time = event.localTime
    ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : TIME_TBA;
  return {
    month,
    weekday,
    day: String(date.getDate()),
    full: date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time,
    short: `${weekday}, ${month} ${date.getDate()} at ${time}`,
  };
}

export function formatPriceRange(priceRanges) {
  const range = priceRanges?.[0];
  if (!range) return null;
  const { currency = 'USD', min, max } = range;
  if (min == null && max == null) return null;
  let fmt;
  try {
    fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 });
  } catch {
    fmt = { format: (n) => `${currency} ${n}` };
  }
  if (min === max || max == null) return fmt.format(min);
  if (min == null) return fmt.format(max);
  return `${fmt.format(min)} – ${fmt.format(max)}`;
}

export function formatLocation(venue) {
  if (!venue) return '';
  return [venue.city, venue.state, venue.country].filter(Boolean).join(', ');
}

// Events with no date yet (TBA) are treated as upcoming.
export function isUpcoming(startsAt) {
  if (!startsAt) return true;
  return new Date(startsAt).getTime() >= Date.now();
}

export function formatTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export const STATUS_LABELS = {
  onsale: 'On sale',
  offsale: 'Off sale',
  canceled: 'Cancelled',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
  rescheduled: 'Rescheduled',
};
