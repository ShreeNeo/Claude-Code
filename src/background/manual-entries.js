/**
 * Manual Time Entries Storage Module
 * Handles manual time entries and tags
 */

const DB_NAME = 'TimeTrackerDB';
const MANUAL_ENTRIES_STORE = 'manual_entries';
const TAGS_STORE = 'tags';

/**
 * Open or create the database with manual entries and tags stores
 */
async function openManualEntriesDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // Increment version

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create manual entries store if it doesn't exist
      if (!db.objectStoreNames.contains(MANUAL_ENTRIES_STORE)) {
        const manualStore = db.createObjectStore(MANUAL_ENTRIES_STORE, {
          keyPath: 'id',
          autoIncrement: true
        });
        manualStore.createIndex('date', 'date', { unique: false });
        manualStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }

      // Create tags store if it doesn't exist
      if (!db.objectStoreNames.contains(TAGS_STORE)) {
        db.createObjectStore(TAGS_STORE, {
          keyPath: 'name'
        });
      }
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
