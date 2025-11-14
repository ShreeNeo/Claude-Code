/**
 * Time Formatter Utility
 * Provides functions to format time durations and dates
 */

/**
 * Formats milliseconds to human-readable string
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export function formatDuration(ms) {
  if (ms < 0) return '0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Formats milliseconds to detailed time string
 * @param {number} ms - Milliseconds
 * @returns {string} Detailed time string
 */
export function formatDetailedDuration(ms) {
  if (ms < 0) return '0 seconds';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }

  const remainingHours = hours % 24;
  if (remainingHours > 0) {
    parts.push(`${remainingHours} hour${remainingHours > 1 ? 's' : ''}`);
  }

  const remainingMinutes = minutes % 60;
  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    const remainingSeconds = seconds % 60;
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}

/**
 * Formats date to readable string
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

/**
 * Formats date and time
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  const d = new Date(date);
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  return `${d.toLocaleDateString('en-US', dateOptions)} ${d.toLocaleTimeString('en-US', timeOptions)}`;
}

/**
 * Gets the start of day timestamp
 * @param {Date|number} date - Date object or timestamp
 * @returns {number} Start of day timestamp
 */
export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Gets the end of day timestamp
 * @param {Date|number} date - Date object or timestamp
 * @returns {number} End of day timestamp
 */
export function getEndOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Gets the start of week timestamp (Sunday)
 * @param {Date|number} date - Date object or timestamp
 * @returns {number} Start of week timestamp
 */
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Gets the end of week timestamp (Saturday)
 * @param {Date|number} date - Date object or timestamp
 * @returns {number} End of week timestamp
 */
export function getEndOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Gets the start of month timestamp
 * @param {Date|number} date - Date object or timestamp
 * @returns {number} Start of month timestamp
 */
export function getStartOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Gets the end of month timestamp
 * @param {Date|number} date - Date object or timestamp
 * @returns {number} End of month timestamp
 */
export function getEndOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Converts hours to milliseconds
 * @param {number} hours - Hours
 * @returns {number} Milliseconds
 */
export function hoursToMs(hours) {
  return hours * 60 * 60 * 1000;
}

/**
 * Converts milliseconds to hours
 * @param {number} ms - Milliseconds
 * @returns {number} Hours
 */
export function msToHours(ms) {
  return ms / (60 * 60 * 1000);
}
