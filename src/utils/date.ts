import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely formats any date value (Date, ISO string, timestamp, or undefined/null)
 * without throwing RangeError on invalid or empty dates.
 */
export function safeFormat(
  dateVal: Date | number | string | null | undefined,
  formatStr: string,
  fallback = ''
): string {
  if (!dateVal) return fallback;
  try {
    const d =
      typeof dateVal === 'string'
        ? parseISO(dateVal)
        : typeof dateVal === 'number'
        ? new Date(dateVal)
        : dateVal;

    if (!isValid(d) || isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
