/**
 * Blocked Page Script
 * Handles the blocked page UI and user interactions
 */

// Motivational messages
const motivationalMessages = [
  "Great job staying focused! Every distraction you avoid brings you closer to your goals.",
  "You're building stronger focus habits. Keep it up!",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your future self will thank you for staying focused today.",
  "Discipline is choosing between what you want now and what you want most.",
  "Focus is the bridge between goals and accomplishment.",
  "The secret of getting ahead is getting started. Stay focused!",
  "Small progress is still progress. Keep going!",
  "Your focus determines your reality. Choose wisely.",
  "Winners focus on winning. Losers focus on winners."
];

/**
 * Initialize the blocked page
 */
async function init() {
  try {
    // Get blocked URL from query params
    const params = new URLSearchParams(window.location.search);
    const blockedUrl = params.get('url') || 'Unknown URL';

    // Display blocked URL
    document.getElementById('blockedUrl').textContent = blockedUrl;

    // Load and display focus stats
    await loadFocusStats();

    // Display random motivational message
    displayMotivationalMessage();

    // Set up event listeners
    setupEventListeners();

  } catch (error) {
    console.error('Error initializing blocked page:', error);
  }
}

/**
 * Load focus statistics
 */
async function loadFocusStats() {
  try {
    const result = await chrome.storage.local.get(['focusStats']);
    const focusStats = result.focusStats || {};

    const today = new Date().toISOString().split('T')[0];
    const todayStats = focusStats[today] || { completedSessions: 0, focusMinutes: 0, blockedSites: 0 };

    // Update UI
    document.getElementById('todaySessionsBlocked').textContent = todayStats.completedSessions || 0;
    document.getElementById('todayFocusTime').textContent = `${todayStats.focusMinutes || 0}m`;
    document.getElementById('todayBlockedCount').textContent = todayStats.blockedSites || 0;

  } catch (error) {
    console.error('Error loading focus stats:', error);
  }
}

/**
 * Display random motivational message
 */
function displayMotivationalMessage() {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  const message = motivationalMessages[randomIndex];
  document.getElementById('motivationText').textContent = message;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Go back button
  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.history.back();
  });

  // Open dashboard button
  document.getElementById('openDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });

  // Disable focus mode link
  document.getElementById('disableFocusLink').addEventListener('click', async (e) => {
    e.preventDefault();

    const confirmed = confirm('Are you sure you want to disable focus mode? This will allow access to all blocked sites.');

    if (confirmed) {
      try {
        // Disable focus mode
        await chrome.storage.sync.set({ focusModeEnabled: false });

        // Notify background script
        chrome.runtime.sendMessage({ action: 'updateFocusMode' });

        // Show success message
        alert('Focus mode has been disabled. You can re-enable it in the dashboard settings.');

        // Redirect to the blocked URL
        const params = new URLSearchParams(window.location.search);
        const blockedUrl = params.get('url');
        if (blockedUrl) {
          window.location.href = blockedUrl;
        } else {
          window.history.back();
        }

      } catch (error) {
        console.error('Error disabling focus mode:', error);
        alert('Failed to disable focus mode. Please try again.');
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
