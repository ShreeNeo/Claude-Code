/**
 * Jest Test Setup
 */

// Mock chrome API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        callback(typeof keys === 'object' ? keys : {});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      })
    },
    local: {
      get: jest.fn((keys, callback) => {
        callback(typeof keys === 'object' ? keys : {});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      })
    }
  },
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
    }),
    onMessage: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    getURL: jest.fn(path => `chrome-extension://test/${path}`)
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      callback([]);
    }),
    get: jest.fn((tabId, callback) => {
      callback({ id: tabId, url: 'https://example.com', title: 'Example' });
    }),
    onActivated: {
      addListener: jest.fn()
    },
    onUpdated: {
      addListener: jest.fn()
    },
    create: jest.fn()
  },
  windows: {
    onFocusChanged: {
      addListener: jest.fn()
    },
    WINDOW_ID_NONE: -1
  },
  idle: {
    onStateChanged: {
      addListener: jest.fn()
    },
    setDetectionInterval: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  }
};

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn()
};
