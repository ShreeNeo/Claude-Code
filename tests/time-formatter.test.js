/**
 * Tests for time-formatter utility
 */

import {
  formatDuration,
  formatDetailedDuration,
  formatDate,
  getStartOfDay,
  getEndOfDay,
  hoursToMs,
  msToHours
} from '../src/utils/time-formatter.js';

describe('Time Formatter', () => {
  describe('formatDuration', () => {
    test('formats seconds correctly', () => {
      expect(formatDuration(5000)).toBe('5s');
    });

    test('formats minutes and seconds correctly', () => {
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    test('formats hours and minutes correctly', () => {
      expect(formatDuration(3665000)).toBe('1h 1m');
    });

    test('formats days and hours correctly', () => {
      expect(formatDuration(90000000)).toBe('1d 1h');
    });

    test('handles negative values', () => {
      expect(formatDuration(-1000)).toBe('0s');
    });

    test('handles zero', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });

  describe('formatDetailedDuration', () => {
    test('formats detailed duration', () => {
      const result = formatDetailedDuration(3665000);
      expect(result).toContain('hour');
      expect(result).toContain('minute');
    });

    test('handles plural forms', () => {
      const result = formatDetailedDuration(7200000); // 2 hours
      expect(result).toContain('hours');
    });
  });

  describe('getStartOfDay', () => {
    test('returns start of day timestamp', () => {
      const date = new Date('2024-01-15T14:30:00');
      const start = getStartOfDay(date);
      const startDate = new Date(start);

      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);
      expect(startDate.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    test('returns end of day timestamp', () => {
      const date = new Date('2024-01-15T14:30:00');
      const end = getEndOfDay(date);
      const endDate = new Date(end);

      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
    });
  });

  describe('hoursToMs and msToHours', () => {
    test('converts hours to milliseconds', () => {
      expect(hoursToMs(1)).toBe(3600000);
      expect(hoursToMs(2)).toBe(7200000);
    });

    test('converts milliseconds to hours', () => {
      expect(msToHours(3600000)).toBe(1);
      expect(msToHours(7200000)).toBe(2);
    });

    test('round trip conversion', () => {
      const hours = 5;
      expect(msToHours(hoursToMs(hours))).toBe(hours);
    });
  });
});
