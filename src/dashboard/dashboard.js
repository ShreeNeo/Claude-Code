/**
 * Dashboard Script
 * Handles dashboard interactions, charts, and data visualization
 */

/* global chrome, Chart */

// State
let currentSection = 'overview';
let currentDateRange = 'today';
let allSessions = [];
let currentStats = null;
let charts = {};

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initializes the dashboard
 */
async function initialize() {
  setupNavigation();
  setupEventListeners();
  await loadSettings();
  await loadData();
}

/**
 * Sets up navigation
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      const section = item.dataset.section;
      switchSection(section);
    });
  });
}

/**
 * Switches to a different section
 */
function switchSection(section) {
  currentSection = section;

  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.section === section) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update sections
  document.querySelectorAll('.section').forEach(sec => {
    if (sec.id === `${section}Section`) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Update page title
  const titles = {
    overview: 'Overview',
    analytics: 'Analytics',
    categories: 'Categories',
    settings: 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[section];

  // Load section-specific data
  if (section === 'analytics') {
    loadAnalytics();
  } else if (section === 'categories') {
    loadCategories();
  }
}

/**
 * Sets up event listeners
 */
function setupEventListeners() {
  // Date range selector
  document.getElementById('dateRange').addEventListener('change', (e) => {
    currentDateRange = e.target.value;
    loadData();
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // Settings buttons
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
  document.getElementById('addBlacklistBtn').addEventListener('click', addToBlacklist);

  // Search
  document.getElementById('searchInput').addEventListener('input', filterTable);
}

/**
 * Loads data based on current date range
 */
async function loadData() {
  try {
    // Calculate date range
    const { start, end } = getDateRange(currentDateRange);

    // For demo purposes, we'll generate some sample data
    // In production, this would fetch from the background script/IndexedDB
    currentStats = generateSampleStats();

    updateOverview(currentStats);
    updateCharts(currentStats);
    updateTable(currentStats);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Gets date range timestamps
 */
function getDateRange(range) {
  const now = new Date();
  let start, end;

  switch (range) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;

    case 'week':
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59);
      break;

    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;

    default:
      start = new Date(now);
      end = new Date(now);
  }

  return { start: start.getTime(), end: end.getTime() };
}

/**
 * Generates sample stats for demonstration
 */
function generateSampleStats() {
  return {
    totalTime: 4 * 60 * 60 * 1000 + 32 * 60 * 1000, // 4h 32m
    sessionCount: 24,
    productivityScore: 68,
    focusScore: 72,
    topDomains: [
      { domain: 'github.com', category: 'Development', time: 2 * 60 * 60 * 1000, visits: 8, percentage: 44 },
      { domain: 'stackoverflow.com', category: 'Development', time: 1 * 60 * 60 * 1000, visits: 5, percentage: 22 },
      { domain: 'youtube.com', category: 'Entertainment', time: 45 * 60 * 1000, visits: 3, percentage: 16 },
      { domain: 'twitter.com', category: 'Social Media', time: 30 * 60 * 1000, visits: 4, percentage: 11 },
      { domain: 'news.ycombinator.com', category: 'News & Reading', time: 17 * 60 * 1000, visits: 4, percentage: 7 }
    ],
    categories: [
      { category: 'Development', time: 3 * 60 * 60 * 1000, percentage: 66, visitCount: 13 },
      { category: 'Entertainment', time: 45 * 60 * 1000, percentage: 16, visitCount: 3 },
      { category: 'Social Media', time: 30 * 60 * 1000, percentage: 11, visitCount: 4 },
      { category: 'News & Reading', time: 17 * 60 * 1000, percentage: 7, visitCount: 4 }
    ],
    hourlyData: Array(24).fill(0).map((_, i) => {
      if (i >= 9 && i <= 17) {
        return Math.random() * 60 * 60 * 1000;
      }
      return 0;
    }),
    dailyData: [
      { date: '2024-01-08', time: 5 * 60 * 60 * 1000 },
      { date: '2024-01-09', time: 4 * 60 * 60 * 1000 },
      { date: '2024-01-10', time: 6 * 60 * 60 * 1000 },
      { date: '2024-01-11', time: 3 * 60 * 60 * 1000 },
      { date: '2024-01-12', time: 5.5 * 60 * 60 * 1000 },
      { date: '2024-01-13', time: 4 * 60 * 60 * 1000 },
      { date: '2024-01-14', time: 4.5 * 60 * 60 * 1000 }
    ]
  };
}

/**
 * Updates overview section
 */
function updateOverview(stats) {
  // Update stat cards
  document.getElementById('totalTime').textContent = formatDuration(stats.totalTime);
  document.getElementById('productivityScore').textContent = `${stats.productivityScore}%`;
  document.getElementById('focusScore').textContent = `${stats.focusScore}%`;
  document.getElementById('sessionCount').textContent = stats.sessionCount;

  // Update changes (placeholder)
  document.getElementById('totalTimeChange').textContent = '+12% from yesterday';
  document.getElementById('totalTimeChange').className = 'stat-change positive';

  document.getElementById('productivityChange').textContent = '+5% from yesterday';
  document.getElementById('productivityChange').className = 'stat-change positive';

  document.getElementById('focusChange').textContent = '-3% from yesterday';
  document.getElementById('focusChange').className = 'stat-change negative';

  document.getElementById('sessionChange').textContent = '+2 from yesterday';
  document.getElementById('sessionChange').className = 'stat-change positive';
}

/**
 * Updates charts
 */
function updateCharts(stats) {
  updateDailyChart(stats);
  updateCategoryChart(stats);
}

/**
 * Updates daily activity chart
 */
function updateDailyChart(stats) {
  const ctx = document.getElementById('dailyChart');

  if (charts.daily) {
    charts.daily.destroy();
  }

  charts.daily = new Chart(ctx, {
    type: 'line',
    data: {
      labels: stats.dailyData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Time Spent',
        data: stats.dailyData.map(d => d.time / (1000 * 60 * 60)),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}h`
          }
        }
      }
    }
  });
}

/**
 * Updates category breakdown chart
 */
function updateCategoryChart(stats) {
  const ctx = document.getElementById('categoryChart');

  if (charts.category) {
    charts.category.destroy();
  }

  const colors = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899'
  ];

  charts.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: stats.categories.map(c => c.category),
      datasets: [{
        data: stats.categories.map(c => c.percentage),
        backgroundColor: colors.slice(0, stats.categories.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

/**
 * Updates domains table
 */
function updateTable(stats) {
  const tbody = document.getElementById('domainsTableBody');

  if (!stats.topDomains || stats.topDomains.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No data available</td></tr>';
    return;
  }

  tbody.innerHTML = stats.topDomains.map((domain, index) => {
    const categoryClass = getCategoryClass(domain.category);

    return `
      <tr>
        <td>${index + 1}</td>
        <td class="domain-cell">${domain.domain}</td>
        <td><span class="badge ${categoryClass}">${domain.category}</span></td>
        <td>${formatDuration(domain.time)}</td>
        <td>${domain.visits}</td>
        <td>${domain.percentage}%</td>
      </tr>
    `;
  }).join('');
}

/**
 * Gets category badge class
 */
function getCategoryClass(category) {
  const productive = ['Development', 'Work & Productivity', 'Education & Learning'];
  const unproductive = ['Social Media', 'Entertainment', 'Gaming'];

  if (productive.includes(category)) {
    return 'badge-productive';
  } else if (unproductive.includes(category)) {
    return 'badge-unproductive';
  }
  return 'badge-neutral';
}

/**
 * Filters table based on search
 */
function filterTable() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#domainsTableBody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * Loads analytics section
 */
function loadAnalytics() {
  updateHourlyChart();
  updateWeeklyChart();
  updateInsights();
}

/**
 * Updates hourly activity heatmap
 */
function updateHourlyChart() {
  const ctx = document.getElementById('hourlyChart');

  if (charts.hourly) {
    charts.hourly.destroy();
  }

  const hourlyData = currentStats.hourlyData.map((time, hour) => ({
    x: hour,
    y: time / (1000 * 60) // Convert to minutes
  }));

  charts.hourly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array(24).fill(0).map((_, i) => `${i.toString().padStart(2, '0')}:00`),
      datasets: [{
        label: 'Minutes',
        data: hourlyData.map(d => d.y),
        backgroundColor: '#4f46e5'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}m`
          }
        }
      }
    }
  });
}

/**
 * Updates weekly comparison chart
 */
function updateWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');

  if (charts.weekly) {
    charts.weekly.destroy();
  }

  charts.weekly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'This Week',
        data: [5.2, 4.8, 6.1, 5.5, 4.2, 3.1, 2.8],
        backgroundColor: '#4f46e5'
      }, {
        label: 'Last Week',
        data: [4.8, 5.1, 5.5, 4.9, 5.2, 3.5, 3.2],
        backgroundColor: '#cbd5e1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}h`
          }
        }
      }
    }
  });
}

/**
 * Updates insights list
 */
function updateInsights() {
  const insights = [
    {
      type: 'success',
      title: 'Highly Productive Day',
      message: 'Your productivity score is 68%. You spent most of your time on development tasks.'
    },
    {
      type: 'info',
      title: 'Most Active Hours',
      message: 'You are most productive between 10 AM and 2 PM. Try scheduling important tasks during this time.'
    },
    {
      type: 'warning',
      title: 'Social Media Usage',
      message: 'You spent 30 minutes on social media today. Consider reducing this to improve focus.'
    }
  ];

  const insightsList = document.getElementById('insightsList');
  insightsList.innerHTML = insights.map(insight => `
    <div class="insight-item ${insight.type}">
      <div class="insight-title">${insight.title}</div>
      <div class="insight-message">${insight.message}</div>
    </div>
  `).join('');
}

/**
 * Loads categories section
 */
function loadCategories() {
  const categoriesGrid = document.getElementById('categoriesGrid');

  if (!currentStats || !currentStats.categories) {
    categoriesGrid.innerHTML = '<div class="loading">No data available</div>';
    return;
  }

  categoriesGrid.innerHTML = currentStats.categories.map(cat => `
    <div class="category-card">
      <div class="category-header">
        <h3 class="category-name">${cat.category}</h3>
      </div>
      <div class="category-time">${formatDuration(cat.time)}</div>
      <div class="category-stats">
        <span>${cat.visitCount} visits</span>
        <span>${cat.percentage}%</span>
      </div>
      <div class="category-bar">
        <div class="category-bar-fill" style="width: ${cat.percentage}%"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Loads settings
 */
async function loadSettings() {
  try {
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get({
        idleTimeout: 1,
        trackingEnabled: true,
        focusMode: false,
        focusModeThreshold: 30,
        blacklist: []
      }, resolve);
    });

    document.getElementById('enableTracking').checked = settings.trackingEnabled;
    document.getElementById('idleTimeout').value = settings.idleTimeout;
    document.getElementById('enableFocusMode').checked = settings.focusMode;
    document.getElementById('focusThreshold').value = settings.focusModeThreshold;

    updateBlacklist(settings.blacklist);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Saves settings
 */
async function saveSettings() {
  try {
    const settings = {
      trackingEnabled: document.getElementById('enableTracking').checked,
      idleTimeout: parseInt(document.getElementById('idleTimeout').value),
      focusMode: document.getElementById('enableFocusMode').checked,
      focusModeThreshold: parseInt(document.getElementById('focusThreshold').value),
      blacklist: Array.from(document.querySelectorAll('.blacklist-item')).map(
        item => item.textContent.trim().replace('×', '')
      )
    };

    await new Promise(resolve => {
      chrome.storage.sync.set(settings, resolve);
    });

    // Update background script
    chrome.runtime.sendMessage({ type: 'updateSettings', settings });

    alert('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
}

/**
 * Updates blacklist display
 */
function updateBlacklist(blacklist) {
  const blacklistList = document.getElementById('blacklistList');

  if (!blacklist || blacklist.length === 0) {
    blacklistList.innerHTML = '<div class="empty-state">No blacklisted domains</div>';
    return;
  }

  blacklistList.innerHTML = blacklist.map(domain => `
    <div class="blacklist-item">
      ${domain}
      <button class="blacklist-remove" onclick="removeFromBlacklist('${domain}')">×</button>
    </div>
  `).join('');
}

/**
 * Adds domain to blacklist
 */
function addToBlacklist() {
  const input = document.getElementById('blacklistInput');
  const domain = input.value.trim();

  if (!domain) return;

  const blacklist = Array.from(document.querySelectorAll('.blacklist-item')).map(
    item => item.textContent.trim().replace('×', '')
  );

  if (!blacklist.includes(domain)) {
    blacklist.push(domain);
    updateBlacklist(blacklist);
    input.value = '';
  }
}

/**
 * Removes domain from blacklist
 */
window.removeFromBlacklist = function(domain) {
  const blacklist = Array.from(document.querySelectorAll('.blacklist-item')).map(
    item => item.textContent.trim().replace('×', '')
  ).filter(d => d !== domain);

  updateBlacklist(blacklist);
};

/**
 * Clears all data
 */
async function clearAllData() {
  if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    return;
  }

  try {
    // This would clear IndexedDB in production
    alert('All data has been cleared.');
    location.reload();
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Error clearing data. Please try again.');
  }
}

/**
 * Exports data as JSON
 */
async function exportData() {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      stats: currentStats,
      sessions: allSessions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetracker-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data. Please try again.');
  }
}

/**
 * Formats duration to readable string
 */
function formatDuration(ms) {
  if (ms < 0) return '0m';

  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}
