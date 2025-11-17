/**
 * Manual Time Entries Storage Module
 * Handles manual time entries and tags
 */

const DB_NAME = 'TimeTrackerDB';
const DB_VERSION = 2; // Match storage.js version
const MANUAL_ENTRIES_STORE = 'manual_entries';
const TAGS_STORE = 'tags';
const SESSIONS_STORE = 'sessions';

/**
 * Opens the existing database (schema is managed by storage.js)
 */
async function openManualEntriesDB() {
  return new Promise((resolve, reject) => {
    // Just open the database, don't define schema here
    // Schema is managed centrally in storage.js
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open TimeTrackerDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };

    // onupgradeneeded should not fire here if storage.js already initialized the DB
    // But we keep it as a fallback for safety
    request.onupgradeneeded = (event) => {
      console.warn('Database upgrade triggered from manual-entries.js - this should be handled by storage.js');
      // The schema should already be created by storage.js
      // This is just a safety fallback
    };
  });
}

/**
 * Add a manual time entry
 */
export async function addManualEntry(entry) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([MANUAL_ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(MANUAL_ENTRIES_STORE);

    const entryWithMetadata = {
      ...entry,
      isManual: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const request = store.add(entryWithMetadata);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error adding manual entry:', error);
    throw error;
  }
}

/**
 * Update an existing entry (manual or automated)
 */
export async function updateEntry(id, updates) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([MANUAL_ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(MANUAL_ENTRIES_STORE);

    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const entry = getRequest.result;

        if (!entry) {
          reject(new Error('Entry not found'));
          return;
        }

        const updatedEntry = {
          ...entry,
          ...updates,
          updatedAt: Date.now()
        };

        const updateRequest = store.put(updatedEntry);

        updateRequest.onsuccess = () => resolve(updatedEntry);
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
}

/**
 * Delete a manual entry
 */
export async function deleteManualEntry(id) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([MANUAL_ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(MANUAL_ENTRIES_STORE);

    const request = store.delete(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting manual entry:', error);
    throw error;
  }
}

/**
 * Get manual entries by date range
 */
export async function getManualEntriesByDate(startDate, endDate) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([MANUAL_ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(MANUAL_ENTRIES_STORE);
    const index = store.index('date');

    const startDateStr = new Date(startDate).toISOString().split('T')[0];
    const endDateStr = new Date(endDate).toISOString().split('T')[0];

    const range = IDBKeyRange.bound(startDateStr, endDateStr);
    const request = index.getAll(range);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting manual entries:', error);
    return [];
  }
}

/**
 * Get all manual entries
 */
export async function getAllManualEntries() {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([MANUAL_ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(MANUAL_ENTRIES_STORE);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting all manual entries:', error);
    return [];
  }
}

/**
 * Add or update a tag
 */
export async function saveTag(tag) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([TAGS_STORE], 'readwrite');
    const store = transaction.objectStore(TAGS_STORE);

    const tagWithMetadata = {
      name: tag.name,
      color: tag.color || '#4f46e5',
      createdAt: tag.createdAt || Date.now(),
      usageCount: tag.usageCount || 0
    };

    const request = store.put(tagWithMetadata);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(tagWithMetadata);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving tag:', error);
    throw error;
  }
}

/**
 * Get all tags
 */
export async function getAllTags() {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([TAGS_STORE], 'readonly');
    const store = transaction.objectStore(TAGS_STORE);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(tagName) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([TAGS_STORE], 'readwrite');
    const store = transaction.objectStore(TAGS_STORE);

    const request = store.delete(tagName);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
}

/**
 * Increment tag usage count
 */
export async function incrementTagUsage(tagName) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([TAGS_STORE], 'readwrite');
    const store = transaction.objectStore(TAGS_STORE);

    const getRequest = store.get(tagName);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const tag = getRequest.result;

        if (tag) {
          tag.usageCount = (tag.usageCount || 0) + 1;
          const updateRequest = store.put(tag);

          updateRequest.onsuccess = () => resolve(tag);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error incrementing tag usage:', error);
    throw error;
  }
}

/**
 * Get entries by tag
 */
export async function getEntriesByTag(tagName) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([MANUAL_ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(MANUAL_ENTRIES_STORE);
    const index = store.index('tags');

    const request = index.getAll(tagName);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting entries by tag:', error);
    return [];
  }
}

/**
 * Update an automatic session (browser tracking session)
 * This marks it as edited and updates the specified fields
 */
export async function updateAutomaticSession(sessionId, updates) {
  try {
    const db = await openManualEntriesDB();
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);

    // Get the existing session
    const getRequest = store.get(sessionId);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const session = getRequest.result;

        if (!session) {
          reject(new Error('Session not found'));
          return;
        }

        // Update the session with new fields and mark as edited
        const updatedSession = {
          ...session,
          ...updates,
          isEdited: true,
          editedAt: Date.now()
        };

        const updateRequest = store.put(updatedSession);

        updateRequest.onsuccess = () => resolve(updatedSession);
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error updating automatic session:', error);
    throw error;
  }
}
