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

// Pomodoro elements
const pomodoroSection = document.getElementById('pomodoroSection');
const togglePomodoroBtn = document.getElementById('togglePomodoroBtn');
const pomodoroContent = document.getElementById('pomodoroContent');
const popupPomodoroType = document.getElementById('popupPomodoroType');
const popupPomodoroTime = document.getElementById('popupPomodoroTime');
const popupPomodoroSession = document.getElementById('popupPomodoroSession');
const popupStartBtn = document.getElementById('popupStartBtn');
const popupPauseBtn = document.getElementById('popupPauseBtn');
const popupResetBtn = document.getElementById('popupResetBtn');
const popupSessionsToday = document.getElementById('popupSessionsToday');
const popupTimeToday = document.getElementById('popupTimeToday');

// State
let currentSession = null;
let isPaused = false;
let updateInterval = null;
let pomodoroState = null;

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

// ============================================
// POMODORO TIMER FUNCTIONS
// ============================================

/**
 * Loads Pomodoro state from service worker
 */
async function loadPomodoroState() {
  try {
    const result = await chrome.storage.sync.get(['focusModeEnabled']);

    // Show Pomodoro section if focus mode is enabled
    if (result.focusModeEnabled && pomodoroSection) {
      pomodoroSection.style.display = 'block';

      // Get state from service worker
      const response = await chrome.runtime.sendMessage({ type: 'getPomodoroState' });
      if (response.success) {
        pomodoroState = response.state;
      }

      // Load today's stats
      const statsResult = await chrome.storage.local.get(['focusStats']);
      const focusStats = statsResult.focusStats || {};
      const today = new Date().toISOString().split('T')[0];
      const todayStats = focusStats[today] || { completedSessions: 0, focusMinutes: 0 };

      popupSessionsToday.textContent = todayStats.completedSessions || 0;

      // Update UI
      await updatePomodoroDisplay();

      // Listen for updates from service worker
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'pomodoroUpdate') {
          pomodoroState = message.state;
          updatePomodoroDisplay();

          // Update stats if they changed
          loadTodayFocusStats();
        }
      });
    }
  } catch (error) {
    console.error('Error loading Pomodoro state:', error);
  }
}

/**
 * Load today's focus stats
 */
async function loadTodayFocusStats() {
  try {
    const statsResult = await chrome.storage.local.get(['focusStats']);
    const focusStats = statsResult.focusStats || {};
    const today = new Date().toISOString().split('T')[0];
    const todayStats = focusStats[today] || { completedSessions: 0, focusMinutes: 0 };

    popupSessionsToday.textContent = todayStats.completedSessions || 0;

    // Time will be updated by updateTimeToday()
  } catch (error) {
    console.error('Error loading focus stats:', error);
  }
}

/**
 * Update Time Today display including current session
 */
async function updateTimeToday() {
  try {
    // Get completed session stats
    const statsResult = await chrome.storage.local.get(['focusStats']);
    const focusStats = statsResult.focusStats || {};
    const today = new Date().toISOString().split('T')[0];
    const todayStats = focusStats[today] || { completedSessions: 0, focusMinutes: 0 };

    let totalMinutes = todayStats.focusMinutes || 0;

    // If there's an active or paused work session, add elapsed time
    if (pomodoroState && (pomodoroState.isRunning || pomodoroState.isPaused) && pomodoroState.sessionType === 'work') {
      const workDuration = pomodoroState.settings.workDuration;
      const elapsed = workDuration - Math.floor(pomodoroState.timeRemaining / 60);
      totalMinutes += elapsed;
    }

    popupTimeToday.textContent = `${totalMinutes}m`;
  } catch (error) {
    console.error('Error updating time today:', error);
  }
}

/**
 * Update Pomodoro display
 */
async function updatePomodoroDisplay() {
  if (!pomodoroState) return;

  const minutes = Math.floor(pomodoroState.timeRemaining / 60);
  const seconds = pomodoroState.timeRemaining % 60;

  popupPomodoroTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update session type
  if (pomodoroState.sessionType === 'work') {
    popupPomodoroType.textContent = 'WORK SESSION';
  } else if (pomodoroState.sessionType === 'shortBreak') {
    popupPomodoroType.textContent = 'SHORT BREAK';
  } else {
    popupPomodoroType.textContent = 'LONG BREAK';
  }

  // Update session info
  popupPomodoroSession.textContent = `Session ${pomodoroState.currentSession} • ${pomodoroState.completedSessions}/${pomodoroState.settings.sessionsUntilLongBreak} until long break`;

  // Update button visibility
  if (pomodoroState.isRunning) {
    popupStartBtn.style.display = 'none';
    popupPauseBtn.style.display = 'flex';
  } else {
    popupStartBtn.style.display = 'flex';
    popupPauseBtn.style.display = 'none';
  }

  // Update Time Today with current session progress
  await updateTimeToday();
}

/**
 * Start Pomodoro timer
 */
async function startPomodoro() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'startPomodoro' });
    if (response.success) {
      pomodoroState = response.state;
      updatePomodoroDisplay();
    }
  } catch (error) {
    console.error('Error starting Pomodoro:', error);
  }
}

/**
 * Pause Pomodoro timer
 */
async function pausePomodoro() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'pausePomodoro' });
    if (response.success) {
      pomodoroState = response.state;
      updatePomodoroDisplay();
    }
  } catch (error) {
    console.error('Error pausing Pomodoro:', error);
  }
}

/**
 * Reset Pomodoro timer
 */
async function resetPomodoro() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'resetPomodoro' });
    if (response.success) {
      pomodoroState = response.state;
      updatePomodoroDisplay();
    }
  } catch (error) {
    console.error('Error resetting Pomodoro:', error);
  }
}

/**
 * Toggle Pomodoro section
 */
function togglePomodoroSection() {
  if (pomodoroContent) {
    pomodoroContent.classList.toggle('collapsed');
    const arrow = togglePomodoroBtn.querySelector('span');
    if (arrow) {
      arrow.textContent = pomodoroContent.classList.contains('collapsed') ? '▶' : '▼';
    }
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

  // Load Pomodoro state
  await loadPomodoroState();

  // Set up event listeners
  pauseBtn.addEventListener('click', togglePause);
  dashboardBtn.addEventListener('click', openDashboard);

  // Pomodoro event listeners
  if (togglePomodoroBtn) {
    togglePomodoroBtn.addEventListener('click', togglePomodoroSection);
  }
  if (popupStartBtn) {
    popupStartBtn.addEventListener('click', startPomodoro);
  }
  if (popupPauseBtn) {
    popupPauseBtn.addEventListener('click', pausePomodoro);
  }
  if (popupResetBtn) {
    popupResetBtn.addEventListener('click', resetPomodoro);
  }

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
