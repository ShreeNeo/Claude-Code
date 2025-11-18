/**
 * Focus Mode Content Script - Blocker
 * Runs at document_start to block sites immediately
 */

(async function() {
  try {
    // Get current URL
    const currentUrl = window.location.href;

    // Check if this URL should be blocked
    const response = await chrome.runtime.sendMessage({
      type: 'checkBlockedUrl',
      url: currentUrl
    });

    if (response && response.shouldBlock) {
      // Immediately redirect to block page
      const blockPageUrl = chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(currentUrl)}`);
      window.location.replace(blockPageUrl);

      // Stop page execution
      window.stop();
    }
  } catch (error) {
    // Silently fail if extension context is invalid
    console.error('Focus blocker error:', error);
  }
})();
