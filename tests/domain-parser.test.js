/**
 * Tests for domain-parser utility
 */

import {
  extractDomain,
  extractRootDomain,
  getDomainDisplayName,
  shouldTrackUrl,
  isValidUrl,
  sanitizeUrl
} from '../src/utils/domain-parser.js';

describe('Domain Parser', () => {
  describe('extractDomain', () => {
    test('extracts domain from URL', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('example.com');
    });

    test('removes www prefix', () => {
      expect(extractDomain('https://www.github.com')).toBe('github.com');
    });

    test('handles subdomains', () => {
      expect(extractDomain('https://api.github.com')).toBe('api.github.com');
    });

    test('handles browser URLs', () => {
      expect(extractDomain('chrome://settings')).toBe('browser');
      expect(extractDomain('about:blank')).toBe('browser');
    });

    test('handles invalid URLs', () => {
      expect(extractDomain('not a url')).toBe('unknown');
      expect(extractDomain('')).toBe('unknown');
      expect(extractDomain(null)).toBe('unknown');
    });
  });

  describe('extractRootDomain', () => {
    test('extracts root domain', () => {
      expect(extractRootDomain('https://api.github.com')).toBe('github.com');
      expect(extractRootDomain('https://mail.google.com')).toBe('google.com');
    });

    test('handles special TLDs', () => {
      expect(extractRootDomain('https://example.co.uk')).toBe('example.co.uk');
      expect(extractRootDomain('https://subdomain.example.co.uk')).toBe('example.co.uk');
    });

    test('handles simple domains', () => {
      expect(extractRootDomain('https://example.com')).toBe('example.com');
    });
  });

  describe('getDomainDisplayName', () => {
    test('returns friendly display name', () => {
      expect(getDomainDisplayName('https://github.com')).toBe('Github');
      expect(getDomainDisplayName('https://stackoverflow.com')).toBe('Stackoverflow');
    });

    test('handles hyphenated domains', () => {
      expect(getDomainDisplayName('https://news-site.com')).toBe('News Site');
    });

    test('handles special cases', () => {
      expect(getDomainDisplayName('chrome://settings')).toBe('Browser');
      expect(getDomainDisplayName('unknown')).toBe('Unknown');
    });
  });

  describe('shouldTrackUrl', () => {
    test('tracks normal URLs', () => {
      expect(shouldTrackUrl('https://example.com')).toBe(true);
      expect(shouldTrackUrl('https://github.com')).toBe(true);
    });

    test('does not track browser URLs', () => {
      expect(shouldTrackUrl('chrome://settings')).toBe(false);
      expect(shouldTrackUrl('about:blank')).toBe(false);
      expect(shouldTrackUrl('chrome://newtab/')).toBe(false);
    });

    test('respects blacklist', () => {
      const blacklist = ['facebook.com', 'twitter.com'];
      expect(shouldTrackUrl('https://facebook.com', blacklist)).toBe(false);
      expect(shouldTrackUrl('https://twitter.com', blacklist)).toBe(false);
      expect(shouldTrackUrl('https://github.com', blacklist)).toBe(true);
    });

    test('does not track sensitive sites', () => {
      expect(shouldTrackUrl('https://mybank.com')).toBe(false);
      expect(shouldTrackUrl('https://paypal.com')).toBe(false);
    });

    test('handles empty/null URLs', () => {
      expect(shouldTrackUrl('')).toBe(false);
      expect(shouldTrackUrl(null)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    test('validates URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('chrome://settings')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    test('removes sensitive query parameters', () => {
      const url = 'https://example.com?token=abc123&key=secret';
      const sanitized = sanitizeUrl(url);

      expect(sanitized).not.toContain('token');
      expect(sanitized).not.toContain('key');
    });

    test('keeps safe query parameters', () => {
      const url = 'https://example.com?page=1&sort=asc';
      const sanitized = sanitizeUrl(url);

      expect(sanitized).toContain('page=1');
      expect(sanitized).toContain('sort=asc');
    });

    test('handles URLs without query params', () => {
      const url = 'https://example.com/path';
      expect(sanitizeUrl(url)).toBe(url);
    });

    test('handles invalid URLs gracefully', () => {
      const url = 'not a url';
      expect(sanitizeUrl(url)).toBe(url);
    });
  });
});
