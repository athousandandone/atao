// Display formatting for civil dates. All entries carry UTC-midnight
// Date instances (schema.ts); the UTC time zone here pins the displayed
// day against local-zone drift. en-GB throughout.

const SHORT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const LONG = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Card and kicker form: "09 Jun 2026". */
export function formatDateShort(date: Date): string {
  return SHORT.format(date);
}

/** Byline form: "9 June 2026". */
export function formatDateLong(date: Date): string {
  return LONG.format(date);
}

/** datetime attribute form: "2026-06-09". */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
