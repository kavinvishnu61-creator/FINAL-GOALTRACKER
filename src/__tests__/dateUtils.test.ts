import { describe, it, expect } from 'vitest';
import { safeFormat, getTodayDateString } from '../utils/date';

describe('Date Utilities', () => {
  it('formats valid ISO strings correctly', () => {
    expect(safeFormat('2026-10-03', 'yyyy')).toBe('2026');
    expect(safeFormat('2026-10-03T10:00:00Z', 'MMM d')).toMatch(/Oct 3/);
  });

  it('handles null, undefined and empty strings gracefully without crashing', () => {
    expect(safeFormat(null, 'yyyy-MM-dd', 'Fallback')).toBe('Fallback');
    expect(safeFormat(undefined, 'yyyy-MM-dd')).toBe('');
    expect(safeFormat('', 'yyyy-MM-dd', 'No date')).toBe('No date');
  });

  it('handles invalid date strings gracefully', () => {
    expect(safeFormat('invalid-date-string', 'yyyy-MM-dd', 'Invalid')).toBe('Invalid');
  });

  it('returns today string in yyyy-MM-dd format', () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
