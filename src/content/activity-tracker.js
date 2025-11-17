/**
 * Content Script - Activity Tracker
 * Tracks user activity on web pages and sends heartbeats to background script
 */

// Activity tracking state
let lastActivityTime = Date.now();
let heartbeatInterval = null;
let activityListeners = [];

// Constants
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];
const DEBOUNCE_DELAY = 1000; // 1 second

// Check if we should track this page
const PRIVACY_PATTERNS = [
  /bank/i,
  /paypal/i,
  /healthcare/i,
  /medical/i,
  /hospital/i,
  /password/i,
  /login/i,
  /signin/i
];

/**
 * Checks if the current page should be tracked
 * @returns {boolean} Whether to track
 */
function shouldTrackPage() {
  const url = window.location.href;
  const title = document.title || '';

  // Don't track sensitive pages
  for (const pattern of PRIVACY_PATTERNS) {
    if (pattern.test(url) || pattern.test(title)) {
      return false;
    }
  }

  // Don't track if page has password input visible
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  if (passwordInputs.length > 0) {
    // Check if any are visible
    for (const input of passwordInputs) {
      const rect = input.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Debounces a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Handles user activity
 */
function handleActivity() {
  lastActivityTime = Date.now();
}

// Debounced activity handler
const debouncedActivityHandler = debounce(handleActivity, DEBOUNCE_DELAY);

/**
 * Sends activity heartbeat to background script
 */
function sendHeartbeat() {
  const now = Date.now();
  const timeSinceActivity = now - lastActivityTime;

  // Only send heartbeat if there was recent activity
  if (timeSinceActivity < HEARTBEAT_INTERVAL) {
    try {
      chrome.runtime.sendMessage({
        type: 'activity',
        timestamp: now,
        url: window.location.href,
        title: document.title
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Heartbeat error:', chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }
}

/**
 * Sets up activity listeners
 */
function setupActivityListeners() {
  if (!shouldTrackPage()) {
    console.log('Neram: Not tracking this page (privacy-sensitive)');
    return;
  }

  // Remove existing listeners
  removeActivityListeners();

  // Add activity listeners
  for (const eventType of ACTIVITY_EVENTS) {
    const listener = () => debouncedActivityHandler();
    document.addEventListener(eventType, listener, { passive: true });
    activityListeners.push({ eventType, listener });
  }

  // Start heartbeat interval
  heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

  // Send initial heartbeat
  handleActivity();
  sendHeartbeat();

  console.log('Neram: Activity tracking started');
}

/**
 * Removes activity listeners
 */
function removeActivityListeners() {
  // Remove event listeners
  for (const { eventType, listener } of activityListeners) {
    document.removeEventListener(eventType, listener);
  }
  activityListeners = [];

  // Clear heartbeat interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/**
 * Handles visibility change
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, pause tracking
    removeActivityListeners();
  } else {
    // Page is visible, resume tracking
    setupActivityListeners();
  }
}

/**
 * Handles page unload
 */
function handleUnload() {
  removeActivityListeners();
}

/**
 * Initializes the content script
 */
function initialize() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupActivityListeners);
  } else {
    setupActivityListeners();
  }

  // Handle visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Handle page unload
  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('unload', handleUnload);

  // Listen for focus/blur
  window.addEventListener('focus', () => {
    handleActivity();
    sendHeartbeat();
  });

  window.addEventListener('blur', () => {
    sendHeartbeat();
  });
}

// Initialize
initialize();

// Cleanup on script unload
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ping') {
      sendResponse({ active: true });
    }
  });
}
