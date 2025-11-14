/**
 * Popup Script
 * Handles popup UI interactions and displays current stats
 */

// Import types from chrome namespace
/* global chrome */

// DOM elements
const pauseBtn = document.getElementById('pauseBtn');
const pauseIcon = document.getElementById('pauseIcon');
const currentDomain = document.getElementById('currentDomain');
const currentDuration = document.getElementById('currentDuration');
const todayTotal = document.getElementById('todayTotal');
const todaySessions = document.getElementById('todaySessions');
const todayProductivity = document.getElementById('todayProductivity');
const topSitesList = document.getElementById('topSitesList');
const dashboardBtn = document.getElementById('dashboardBtn');
const currentSessionInfo = document.getElementById('currentSessionInfo');

// State
let currentSession = null;
let isPaused = false;
let updateInterval = null;

/**
 * Formats milliseconds to time string
 */
function formatDuration(ms) {
  if (ms < 0) return '0m 0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Formats duration for display (shorter format)
 */
function formatShortDuration(ms) {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return '<1m';
}

/**
 * Gets productivity class for styling
 */
function getProductivityClass(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Updates current session display
 */
function updateCurrentSession() {
  if (!currentSession) {
    currentDomain.textContent = 'No active session';
    currentDuration.textContent = '—';
    return;
  }

  currentDomain.textContent = currentSession.domain || 'Unknown';

  // Calculate current duration
  const now = Date.now();
  const duration = now - currentSession.startTime;
  currentDuration.textContent = formatDuration(duration);
}

/**
 * Loads and displays today's stats
 */
async function loadTodayStats() {
  try {
    // Get today's sessions from storage
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Since we can't directly import from background script, we'll use messaging
    // For now, we'll calculate from the current session
    // In a real implementation, you'd fetch this from the background script

    // Placeholder stats
    let totalTime = 0;
    let sessionCount = 0;
    let productivityScore = 0;
    let topSites = [];

    // This would normally be fetched from background script
    // For demo purposes, we'll show current session if available
    if (currentSession) {
      const now = Date.now();
      totalTime = now - currentSession.startTime;
      sessionCount = 1;
      productivityScore = 75; // Placeholder

      topSites = [{
        domain: currentSession.domain,
        time: totalTime,
        percentage: 100,
        category: currentSession.category || 'Other'
      }];
    }

    // Update stats display
    todayTotal.textContent = formatShortDuration(totalTime);
    todaySessions.textContent = sessionCount;
    todayProductivity.textContent = productivityScore > 0 ? `${productivityScore}%` : '—';
    todayProductivity.className = `stat-value ${getProductivityClass(productivityScore)}`;

    // Update top sites list
    updateTopSitesList(topSites);
  } catch (error) {
    console.error('Error loading today stats:', error);
    topSitesList.innerHTML = '<div class="empty-state">Error loading stats</div>';
  }
}

/**
 * Updates top sites list
 */
function updateTopSitesList(sites) {
  if (!sites || sites.length === 0) {
    topSitesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">No data yet. Start browsing!</div>
      </div>
    `;
    return;
  }

  topSitesList.innerHTML = sites.slice(0, 5).map((site, index) => `
    <div class="site-item">
      <div class="site-rank">${index + 1}</div>
      <div class="site-info">
        <div class="site-domain">${site.domain}</div>
        <div class="site-category">${site.category}</div>
        <div class="site-bar">
          <div class="site-bar-fill" style="width: ${site.percentage}%"></div>
        </div>
      </div>
      <div class="site-time">${formatShortDuration(site.time)}</div>
    </div>
  `).join('');
}

/**
 * Toggles pause state
 */
async function togglePause() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'togglePause' });

    if (response.success) {
      isPaused = response.isPaused;
      updatePauseButton();

      if (isPaused) {
        currentSessionInfo.classList.add('session-paused');
      } else {
        currentSessionInfo.classList.remove('session-paused');
      }
    }
  } catch (error) {
    console.error('Error toggling pause:', error);
  }
}

/**
 * Updates pause button appearance
 */
function updatePauseButton() {
  if (isPaused) {
    pauseIcon.textContent = '▶️';
    pauseBtn.title = 'Resume tracking';
  } else {
    pauseIcon.textContent = '⏸️';
    pauseBtn.title = 'Pause tracking';
  }
}

/**
 * Opens dashboard in new tab
 */
function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
}

/**
 * Loads current state from background
 */
async function loadState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getState' });

    if (response.success) {
      currentSession = response.state.currentSession;
      isPaused = response.state.isPaused;

      updatePauseButton();
      updateCurrentSession();

      if (isPaused) {
        currentSessionInfo.classList.add('session-paused');
      } else {
        currentSessionInfo.classList.remove('session-paused');
      }
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

/**
 * Initializes popup
 */
async function initialize() {
  // Load current state
  await loadState();

  // Load today's stats
  await loadTodayStats();

  // Set up event listeners
  pauseBtn.addEventListener('click', togglePause);
  dashboardBtn.addEventListener('click', openDashboard);

  // Update current session every second
  updateInterval = setInterval(() => {
    if (currentSession && !isPaused) {
      updateCurrentSession();
    }
  }, 1000);
}

// Clean up on popup close
window.addEventListener('unload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
