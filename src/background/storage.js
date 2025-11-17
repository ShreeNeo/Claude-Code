/**
 * Storage Module
 * Handles all data persistence using IndexedDB and chrome.storage
 */

const DB_NAME = 'NeramDB';
const DB_VERSION = 2; // Updated to match manual-entries.js

// IndexedDB Store Names
const STORES = {
  SESSIONS: 'sessions',
  DAILY_STATS: 'daily_stats',
  WEEKLY_STATS: 'weekly_stats',
  MONTHLY_STATS: 'monthly_stats',
  CATEGORIES: 'categories',
  MANUAL_ENTRIES: 'manual_entries',
  TAGS: 'tags'
};

let db = null;

/**
 * Initializes the IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database failed to open:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      console.log('Database upgrade needed from version', event.oldVersion, 'to', DB_VERSION);

      // Create sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionsStore = db.createObjectStore(STORES.SESSIONS, {
          keyPath: 'id',
          autoIncrement: true
        });
        sessionsStore.createIndex('domain', 'domain', { unique: false });
        sessionsStore.createIndex('date', 'date', { unique: false });
        sessionsStore.createIndex('startTime', 'startTime', { unique: false });
        console.log('Created sessions store');
      }

      // Create daily_stats store
      if (!db.objectStoreNames.contains(STORES.DAILY_STATS)) {
        const dailyStore = db.createObjectStore(STORES.DAILY_STATS, {
          keyPath: 'date'
        });
        dailyStore.createIndex('date', 'date', { unique: true });
        console.log('Created daily_stats store');
      }

      // Create weekly_stats store
      if (!db.objectStoreNames.contains(STORES.WEEKLY_STATS)) {
        const weeklyStore = db.createObjectStore(STORES.WEEKLY_STATS, {
          keyPath: 'id',
          autoIncrement: true
        });
        weeklyStore.createIndex('weekStart', 'weekStart', { unique: false });
        console.log('Created weekly_stats store');
      }

      // Create monthly_stats store
      if (!db.objectStoreNames.contains(STORES.MONTHLY_STATS)) {
        const monthlyStore = db.createObjectStore(STORES.MONTHLY_STATS, {
          keyPath: 'id',
          autoIncrement: true
        });
        monthlyStore.createIndex('month_year', ['month', 'year'], { unique: true });
        console.log('Created monthly_stats store');
      }

      // Create categories store
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoriesStore = db.createObjectStore(STORES.CATEGORIES, {
          keyPath: 'domain'
        });
        console.log('Created categories store');
      }

      // Create manual_entries store (for v2)
      if (!db.objectStoreNames.contains(STORES.MANUAL_ENTRIES)) {
        const manualStore = db.createObjectStore(STORES.MANUAL_ENTRIES, {
          keyPath: 'id',
          autoIncrement: true
        });
        manualStore.createIndex('date', 'date', { unique: false });
        manualStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        console.log('Created manual_entries store');
      }

      // Create tags store (for v2)
      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        db.createObjectStore(STORES.TAGS, {
          keyPath: 'name'
        });
        console.log('Created tags store');
      }
    };
  });
}

/**
 * Adds a session to the database
 * @param {Object} session - Session object
 * @returns {Promise<number>} Session ID
 */
export async function addSession(session) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);

    const request = store.add(session);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Updates a session in the database
 * @param {Object} session - Session object with id
 * @returns {Promise<void>}
 */
export async function updateSession(session) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);

    const request = store.put(session);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Updates an automatic session (marks it as edited)
 * @param {number} sessionId - Session ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateAutomaticSession(sessionId, updates) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);

    // First get the existing session
    const getRequest = store.get(sessionId);

    getRequest.onsuccess = () => {
      const session = getRequest.result;
      if (!session) {
        reject(new Error('Session not found'));
        return;
      }

      // Update fields
      const updatedSession = {
        ...session,
        ...updates,
        isEdited: true,
        editedAt: Date.now()
      };

      // Save updated session
      const putRequest = store.put(updatedSession);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Gets a single session by ID
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Session object
 */
export async function getSessionById(sessionId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.SESSIONS);

    const request = store.get(sessionId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets sessions by date range
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 * @returns {Promise<Array>} Array of sessions
 */
export async function getSessionsByDateRange(startTime, endTime) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.SESSIONS);
    const index = store.index('startTime');

    const range = IDBKeyRange.bound(startTime, endTime);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets sessions for today
 * @returns {Promise<Array>} Array of sessions
 */
export async function getTodaySessions() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

  return getSessionsByDateRange(startOfDay, endOfDay);
}

/**
 * Gets all sessions for a specific domain
 * @param {string} domain - Domain name
 * @returns {Promise<Array>} Array of sessions
 */
export async function getSessionsByDomain(domain) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.SESSIONS);
    const index = store.index('domain');

    const request = index.getAll(domain);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates daily stats
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Object} stats - Stats object
 * @returns {Promise<void>}
 */
export async function saveDailyStats(date, stats) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DAILY_STATS], 'readwrite');
    const store = transaction.objectStore(STORES.DAILY_STATS);

    const statsWithDate = { ...stats, date };
    const request = store.put(statsWithDate);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets daily stats for a date
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<Object>} Stats object
 */
export async function getDailyStats(date) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DAILY_STATS], 'readonly');
    const store = transaction.objectStore(STORES.DAILY_STATS);

    const request = store.get(date);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves weekly stats
 * @param {Object} stats - Weekly stats object
 * @returns {Promise<number>} Stats ID
 */
export async function saveWeeklyStats(stats) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.WEEKLY_STATS], 'readwrite');
    const store = transaction.objectStore(STORES.WEEKLY_STATS);

    const request = store.add(stats);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves monthly stats
 * @param {Object} stats - Monthly stats object
 * @returns {Promise<number>} Stats ID
 */
export async function saveMonthlyStats(stats) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MONTHLY_STATS], 'readwrite');
    const store = transaction.objectStore(STORES.MONTHLY_STATS);

    const request = store.put(stats);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets category mapping for a domain
 * @param {string} domain - Domain name
 * @returns {Promise<Object>} Category mapping
 */
export async function getCategoryMapping(domain) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CATEGORIES], 'readonly');
    const store = transaction.objectStore(STORES.CATEGORIES);

    const request = store.get(domain);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves category mapping for a domain
 * @param {string} domain - Domain name
 * @param {string} category - Category name
 * @returns {Promise<void>}
 */
export async function saveCategoryMapping(domain, category) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CATEGORIES], 'readwrite');
    const store = transaction.objectStore(STORES.CATEGORIES);

    const request = store.put({ domain, category });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes old sessions (data retention)
 * @param {number} daysToKeep - Number of days to keep
 * @returns {Promise<number>} Number of deleted sessions
 */
export async function deleteOldSessions(daysToKeep = 90) {
  return new Promise((resolve, reject) => {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);
    const index = store.index('startTime');

    const range = IDBKeyRange.upperBound(cutoffDate);
    const request = index.openCursor(range);

    let deleteCount = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        deleteCount++;
        cursor.continue();
      } else {
        resolve(deleteCount);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Exports all data as JSON
 * @returns {Promise<Object>} All data
 */
export async function exportAllData() {
  const data = {};

  for (const storeName of Object.values(STORES)) {
    data[storeName] = await new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return data;
}

/**
 * Clears all data (for testing or reset)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  const promises = Object.values(STORES).map(storeName => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  return Promise.all(promises);
}

// Chrome Storage API helpers for settings and state

/**
 * Gets settings from chrome.storage.sync
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      idleTimeout: 60, // seconds
      blacklist: [],
      trackingEnabled: true,
      focusMode: false,
      focusModeThreshold: 30, // minutes
      distractingSites: ['facebook.com', 'twitter.com', 'instagram.com'],
      customCategories: {}
    }, resolve);
  });
}

/**
 * Saves settings to chrome.storage.sync
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

/**
 * Gets current tracking state from chrome.storage.local
 * @returns {Promise<Object>} Tracking state
 */
export async function getTrackingState() {
  return new Promise((resolve) => {
    chrome.storage.local.get({
      currentSession: null,
      isTracking: true,
      isPaused: false,
      lastActivityTime: Date.now()
    }, resolve);
  });
}

/**
 * Saves tracking state to chrome.storage.local
 * @param {Object} state - State to save
 * @returns {Promise<void>}
 */
export async function saveTrackingState(state) {
  return new Promise((resolve) => {
    chrome.storage.local.set(state, resolve);
  });
}
