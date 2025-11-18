/**
 * Focus Mode Content Script - Blocker
 * Runs at document_start to block sites immediately
 */

(function() {
  'use strict';

  const currentUrl = window.location.href;

  // Skip chrome:// and extension URLs
  if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://')) {
    return;
  }

  // Function to check and block
  async function checkAndBlock() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'checkBlockedUrl',
        url: currentUrl
      });

      if (response && response.shouldBlock) {
        // Block the page immediately
        const blockPageUrl = chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(currentUrl)}`);

        // Stop page loading
        window.stop();

        // Replace location
        window.location.replace(blockPageUrl);
      }
    } catch (error) {
      // Silently fail if extension context is invalid
      console.error('Focus blocker error:', error);
    }
  }

  // Check immediately
  checkAndBlock();
})();
