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

// Set idle detection interval
chrome.idle.setDetectionInterval(IDLE_THRESHOLD);

// Initialize on install or update
chrome.runtime.onInstalled.addListener(initialize);

// Initialize on startup
chrome.runtime.onStartup.addListener(initialize);

// Initialize immediately
initialize();
