/**
 * Background Service Worker
 * Main background script that handles tab tracking and time management
 */

import {
  initDatabase,
  addSession,
  updateSession,
  getTrackingState,
  saveTrackingState,
  getSettings,
  deleteOldSessions
} from './storage.js';

import {
  extractDomain,
  extractRootDomain,
  extractPageTitle,
  shouldTrackUrl
} from '../utils/domain-parser.js';

import { classifyDomain } from '../utils/category-classifier.js';

// State variables
let currentSession = null;
let lastActivityTime = Date.now();
let isTracking = true;
let isPaused = false;
let settings = {};

// Focus mode state
let focusModeSettings = {
  enabled: false,
  blockedPatterns: [],
  scheduleEnabled: false,
  scheduleStart: '09:00',
  scheduleEnd: '17:00'
};

// Constants
const IDLE_CHECK_INTERVAL = 30000; // 30 seconds
const IDLE_THRESHOLD = 60; // 60 seconds default
const HEARTBEAT_TIMEOUT = 60000; // 1 minute without activity = idle
const DATA_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // Once per day

/**
 * Initializes the extension
 */
async function initialize() {
  console.log('Neram initializing...');

  try {
    // Initialize database
    await initDatabase();
    console.log('Database initialized');

    // Load settings
    settings = await getSettings();
    console.log('Settings loaded:', settings);

    // Load focus mode settings
    await loadFocusModeSettings();

    // Load tracking state
    const state = await getTrackingState();
    isTracking = state.isTracking;
    isPaused = state.isPaused;
    lastActivityTime = state.lastActivityTime || Date.now();

    // If there was a current session, end it (extension was reloaded/updated)
    if (state.currentSession) {
      await endSession(state.currentSession);
    }

    // Start tracking current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      await startTrackingTab(tabs[0]);
    }

    // Set up alarms for periodic tasks
    chrome.alarms.create('idleCheck', { periodInMinutes: 0.5 });
    chrome.alarms.create('dataCleanup', { periodInMinutes: 1440 }); // Once per day

    console.log('Neram initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

/**
 * Starts tracking a tab
 * @param {Object} tab - Chrome tab object
 */
async function startTrackingTab(tab) {
  if (!tab || !tab.url) return;

  // End current session if exists
  if (currentSession) {
    await endSession(currentSession);
  }

  // Check if we should track this URL
  if (!shouldTrackUrl(tab.url, settings.blacklist)) {
    console.log('Not tracking:', tab.url);
    currentSession = null;
    await saveTrackingState({ currentSession: null });
    return;
  }

  // Don't start if paused
  if (isPaused || !isTracking) {
    console.log('Tracking is paused');
    return;
  }

  const domain = extractRootDomain(tab.url);
  const title = extractPageTitle(tab);
  const category = classifyDomain(domain);

  currentSession = {
    domain,
    title,
    url: tab.url,
    category,
    startTime: Date.now(),
    endTime: null,
    duration: 0,
    date: new Date().toISOString().split('T')[0],
    tabId: tab.id
  };

  lastActivityTime = Date.now();

  // Save session to database
  try {
    const sessionId = await addSession(currentSession);
    currentSession.id = sessionId;

    await saveTrackingState({
      currentSession,
      lastActivityTime,
      isTracking,
      isPaused
    });

    console.log('Started tracking:', domain, '- Session ID:', sessionId);
  } catch (error) {
    console.error('Error starting session:', error);
  }
}

/**
 * Ends the current tracking session
 * @param {Object} session - Session to end
 */
async function endSession(session) {
  if (!session || !session.id) return;

  const now = Date.now();
  session.endTime = now;
  session.duration = now - session.startTime;

  // Only save sessions longer than 1 second
  if (session.duration > 1000) {
    try {
      await updateSession(session);
      console.log('Ended session:', session.domain, '- Duration:', session.duration, 'ms');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  currentSession = null;
  await saveTrackingState({
    currentSession: null,
    lastActivityTime,
    isTracking,
    isPaused
  });
}

/**
 * Handles tab activation (user switches tabs)
 * @param {Object} activeInfo - Active tab info
 */
async function handleTabActivated(activeInfo) {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await startTrackingTab(tab);
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
}

/**
 * Handles tab updates (URL changes)
 * @param {number} tabId - Tab ID
 * @param {Object} changeInfo - Change info
 * @param {Object} tab - Tab object
 */
async function handleTabUpdated(tabId, changeInfo, tab) {
  // Only respond to URL changes on the active tab
  if (changeInfo.url && tab.active) {
    await startTrackingTab(tab);
  }
}

/**
 * Handles window focus changes
 * @param {number} windowId - Window ID
 */
async function handleWindowFocusChanged(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    if (currentSession) {
      await endSession(currentSession);
    }
  } else {
    // Browser gained focus
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs.length > 0) {
      await startTrackingTab(tabs[0]);
    }
  }
}

/**
 * Handles idle state changes
 * @param {string} newState - New idle state (active, idle, locked)
 */
async function handleIdleStateChanged(newState) {
  console.log('Idle state changed:', newState);

  if (newState === 'idle' || newState === 'locked') {
    // User is idle or screen is locked
    if (currentSession) {
      await endSession(currentSession);
    }
  } else if (newState === 'active') {
    // User became active
    lastActivityTime = Date.now();

    // Resume tracking current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      await startTrackingTab(tabs[0]);
    }
  }
}

/**
 * Handles activity heartbeat from content script
 * @param {Object} message - Message from content script
 */
function handleActivityHeartbeat(message) {
  if (message.type === 'activity') {
    lastActivityTime = Date.now();

    // Update current session if it exists
    if (currentSession) {
      saveTrackingState({
        currentSession,
        lastActivityTime,
        isTracking,
        isPaused
      });
    }
  }
}

/**
 * Checks for idle timeout
 */
async function checkIdleTimeout() {
  if (!currentSession) return;

  const now = Date.now();
  const timeSinceActivity = now - lastActivityTime;

  // If no activity for longer than heartbeat timeout, consider idle
  if (timeSinceActivity > HEARTBEAT_TIMEOUT) {
    console.log('User idle due to inactivity');
    await endSession(currentSession);
  }
}

/**
 * Performs data cleanup (deletes old sessions)
 */
async function performDataCleanup() {
  try {
    const deletedCount = await deleteOldSessions(90);
    console.log(`Data cleanup: deleted ${deletedCount} old sessions`);
  } catch (error) {
    console.error('Error during data cleanup:', error);
  }
}

// ============================================
// FOCUS MODE & WEBSITE BLOCKING
// ============================================

/**
 * Load focus mode settings
 */
async function loadFocusModeSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'focusModeEnabled',
      'blockSocialMedia',
      'blockNews',
      'blockEntertainment',
      'blockShopping',
      'customBlockedSites',
      'focusScheduleEnabled',
      'focusScheduleStart',
      'focusScheduleEnd'
    ]);

    focusModeSettings.enabled = result.focusModeEnabled || false;
    focusModeSettings.scheduleEnabled = result.focusScheduleEnabled || false;
    focusModeSettings.scheduleStart = result.focusScheduleStart || '09:00';
    focusModeSettings.scheduleEnd = result.focusScheduleEnd || '17:00';

    // Build blocked patterns
    focusModeSettings.blockedPatterns = buildBlockedPatterns(result);

    console.log('Focus mode settings loaded:', focusModeSettings);
  } catch (error) {
    console.error('Error loading focus mode settings:', error);
  }
}

/**
 * Build list of blocked URL patterns from settings
 */
function buildBlockedPatterns(settings) {
  const patterns = [];

  // Social media sites
  if (settings.blockSocialMedia !== false) {
    patterns.push(
      '*://*.facebook.com/*',
      '*://*.fb.com/*',
      '*://*.twitter.com/*',
      '*://*.x.com/*',
      '*://*.instagram.com/*',
      '*://*.tiktok.com/*',
      '*://*.reddit.com/*',
      '*://*.linkedin.com/feed/*',
      '*://*.snapchat.com/*',
      '*://*.pinterest.com/*'
    );
  }

  // News sites
  if (settings.blockNews) {
    patterns.push(
      '*://*.cnn.com/*',
      '*://*.bbc.com/news/*',
      '*://*.nytimes.com/*',
      '*://*.theguardian.com/*',
      '*://*.washingtonpost.com/*',
      '*://*.reuters.com/*',
      '*://*.apnews.com/*',
      '*://*.news.google.com/*',
      '*://*.news.yahoo.com/*',
      '*://*.huffpost.com/*'
    );
  }

  // Entertainment sites
  if (settings.blockEntertainment !== false) {
    patterns.push(
      '*://*.youtube.com/*',
      '*://*.netflix.com/*',
      '*://*.twitch.tv/*',
      '*://*.hulu.com/*',
      '*://*.disneyplus.com/*',
      '*://*.spotify.com/*',
      '*://*.soundcloud.com/*',
      '*://*.9gag.com/*',
      '*://*.imgur.com/*'
    );
  }

  // Shopping sites
  if (settings.blockShopping) {
    patterns.push(
      '*://*.amazon.com/*',
      '*://*.ebay.com/*',
      '*://*.etsy.com/*',
      '*://*.walmart.com/*',
      '*://*.target.com/*',
      '*://*.bestbuy.com/*',
      '*://*.aliexpress.com/*',
      '*://*.alibaba.com/*'
    );
  }

  // Custom blocked sites
  if (settings.customBlockedSites) {
    const customSites = settings.customBlockedSites.split('\n')
      .map(site => site.trim())
      .filter(site => site.length > 0);

    for (const site of customSites) {
      // Convert simple patterns to match patterns
      if (site.startsWith('*.')) {
        patterns.push(`*://${site}/*`);
      } else if (site.includes('*')) {
        patterns.push(`*://${site}/*`);
      } else {
        patterns.push(`*://${site}/*`);
        patterns.push(`*://*.${site}/*`);
      }
    }
  }

  return patterns;
}

/**
 * Check if focus mode should be active based on schedule
 */
function isFocusModeActive() {
  if (!focusModeSettings.enabled) {
    return false;
  }

  // If schedule is not enabled, focus mode is always active when enabled
  if (!focusModeSettings.scheduleEnabled) {
    return true;
  }

  // Check if current time is within schedule
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const start = focusModeSettings.scheduleStart;
  const end = focusModeSettings.scheduleEnd;

  return currentTime >= start && currentTime <= end;
}

/**
 * Check if a URL should be blocked
 */
function shouldBlockUrl(url) {
  if (!isFocusModeActive()) {
    return false;
  }

  // Don't block chrome:// or extension pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return false;
  }

  // Check against blocked patterns
  for (const pattern of focusModeSettings.blockedPatterns) {
    if (matchesPattern(url, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Simple pattern matching for URL blocking
 */
function matchesPattern(url, pattern) {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Update blocked sites statistics
 */
async function incrementBlockedSiteCount() {
  try {
    const result = await chrome.storage.local.get(['focusStats']);
    const focusStats = result.focusStats || {};

    const today = new Date().toISOString().split('T')[0];
    if (!focusStats[today]) {
      focusStats[today] = { completedSessions: 0, focusMinutes: 0, blockedSites: 0 };
    }

    focusStats[today].blockedSites = (focusStats[today].blockedSites || 0) + 1;

    await chrome.storage.local.set({ focusStats });
  } catch (error) {
    console.error('Error updating blocked site count:', error);
  }
}

/**
 * Redirect blocked URL to block page
 */
function getBlockPageUrl(originalUrl) {
  return chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(originalUrl)}`);
}

/**
 * Handles alarm events
 * @param {Object} alarm - Alarm object
 */
async function handleAlarm(alarm) {
  if (alarm.name === 'idleCheck') {
    await checkIdleTimeout();
  } else if (alarm.name === 'dataCleanup') {
    await performDataCleanup();
  }
}

/**
 * Handles messages from popup and content scripts
 * @param {Object} message - Message object
 * @param {Object} sender - Sender object
 * @param {Function} sendResponse - Response callback
 */
async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'activity':
        handleActivityHeartbeat(message);
        sendResponse({ success: true });
        break;

      case 'getState':
        sendResponse({
          success: true,
          state: {
            currentSession,
            isTracking,
            isPaused,
            lastActivityTime
          }
        });
        break;

      case 'togglePause':
        isPaused = !isPaused;

        if (isPaused && currentSession) {
          await endSession(currentSession);
        } else if (!isPaused) {
          // Resume tracking
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs.length > 0) {
            await startTrackingTab(tabs[0]);
          }
        }

        await saveTrackingState({
          currentSession,
          lastActivityTime,
          isTracking,
          isPaused
        });

        sendResponse({ success: true, isPaused });
        break;

      case 'toggleTracking':
        isTracking = !isTracking;

        if (!isTracking && currentSession) {
          await endSession(currentSession);
        }

        await saveTrackingState({
          currentSession,
          lastActivityTime,
          isTracking,
          isPaused
        });

        sendResponse({ success: true, isTracking });
        break;

      case 'updateSettings':
        settings = { ...settings, ...message.settings };
        sendResponse({ success: true });
        break;

      case 'updateFocusMode':
        await loadFocusModeSettings();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }

  return true; // Keep channel open for async response
}

// Set up event listeners
chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.tabs.onUpdated.addListener(handleTabUpdated);
chrome.windows.onFocusChanged.addListener(handleWindowFocusChanged);
chrome.idle.onStateChanged.addListener(handleIdleStateChanged);
chrome.alarms.onAlarm.addListener(handleAlarm);
chrome.runtime.onMessage.addListener(handleMessage);

// Focus mode: Block navigation to blocked sites
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId !== 0) return; // Only handle main frame

    const url = details.url;
    if (shouldBlockUrl(url)) {
      console.log('Blocking URL:', url);

      // Increment blocked site count
      await incrementBlockedSiteCount();

      // Redirect to block page
      chrome.tabs.update(details.tabId, {
        url: getBlockPageUrl(url)
      });
    }
  }
);

// Set idle detection interval
chrome.idle.setDetectionInterval(IDLE_THRESHOLD);

// Initialize on install or update
chrome.runtime.onInstalled.addListener(initialize);

// Initialize on startup
chrome.runtime.onStartup.addListener(initialize);

// Initialize immediately
initialize();
