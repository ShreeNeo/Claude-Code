/**
 * Domain Parser Utility
 * Handles URL parsing and domain extraction
 */

/**
 * Extracts domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export function extractDomain(url) {
  try {
    if (!url) return 'unknown';

    // Handle special browser URLs
    if (url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:')) {
      return 'browser';
    }

    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    // Remove www. prefix
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch (error) {
    console.error('Error extracting domain:', error);
    return 'unknown';
  }
}

/**
 * Extracts root domain (without subdomains except common ones)
 * @param {string} url - Full URL
 * @returns {string} Root domain
 */
export function extractRootDomain(url) {
  try {
    const domain = extractDomain(url);

    if (domain === 'browser' || domain === 'unknown') {
      return domain;
    }

    const parts = domain.split('.');

    // Handle special TLDs (e.g., co.uk, com.au)
    const specialTLDs = ['co.uk', 'com.au', 'co.jp', 'com.br', 'co.in'];
    const lastTwo = parts.slice(-2).join('.');

    if (specialTLDs.includes(lastTwo) && parts.length > 2) {
      return parts.slice(-3).join('.');
    }

    // Return last two parts (domain.tld)
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }

    return domain;
  } catch (error) {
    console.error('Error extracting root domain:', error);
    return 'unknown';
  }
}

/**
 * Gets a display-friendly domain name
 * @param {string} url - Full URL
 * @returns {string} Display name
 */
export function getDomainDisplayName(url) {
  const domain = extractRootDomain(url);

  if (domain === 'browser') return 'Browser';
  if (domain === 'unknown') return 'Unknown';

  // Capitalize first letter
  return domain.split('.')[0]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Checks if URL should be tracked
 * @param {string} url - URL to check
 * @param {Array<string>} blacklist - Blacklisted domains
 * @returns {boolean} Whether to track the URL
 */
export function shouldTrackUrl(url, blacklist = []) {
  if (!url) return false;

  // Don't track browser URLs
  if (url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.startsWith('firefox://') ||
      url.startsWith('about:')) {
    return false;
  }

  // Don't track new tab pages
  if (url === 'chrome://newtab/' ||
      url === 'edge://newtab/' ||
      url === 'about:newtab') {
    return false;
  }

  const domain = extractRootDomain(url);

  // Check blacklist
  if (blacklist.includes(domain)) {
    return false;
  }

  // Privacy-sensitive sites (banking, healthcare)
  const sensitiveKeywords = ['bank', 'paypal', 'healthcare', 'medical', 'hospital'];
  const domainLower = domain.toLowerCase();

  for (const keyword of sensitiveKeywords) {
    if (domainLower.includes(keyword)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates if a string is a valid URL
 * @param {string} str - String to validate
 * @returns {boolean} Whether the string is a valid URL
 */
export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts page title from tab info
 * @param {Object} tab - Chrome tab object
 * @returns {string} Page title
 */
export function extractPageTitle(tab) {
  if (!tab) return 'Unknown';

  if (tab.title) {
    // Truncate very long titles
    return tab.title.length > 100
      ? tab.title.substring(0, 97) + '...'
      : tab.title;
  }

  return getDomainDisplayName(tab.url);
}

/**
 * Groups similar URLs (same domain)
 * @param {Array<Object>} sessions - Array of session objects
 * @returns {Object} Grouped sessions by domain
 */
export function groupByDomain(sessions) {
  const grouped = {};

  for (const session of sessions) {
    const domain = session.domain || 'unknown';

    if (!grouped[domain]) {
      grouped[domain] = {
        domain,
        sessions: [],
        totalTime: 0,
        visitCount: 0
      };
    }

    grouped[domain].sessions.push(session);
    grouped[domain].totalTime += session.duration || 0;
    grouped[domain].visitCount++;
  }

  return grouped;
}

/**
 * Sanitizes URL for storage (removes sensitive query params)
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
  try {
    const urlObj = new URL(url);

    // Remove sensitive query parameters
    const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth', 'session'];

    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch {
    return url;
  }
}
