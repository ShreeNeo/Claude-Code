/**
 * Dashboard Script
 * Handles dashboard interactions, charts, and data visualization
 */

/* global chrome */

// Import Chart.js, Calendar Sync, and GitHub Sync
import Chart from 'chart.js/auto';
import calendarSync from '../integrations/calendar-sync.js';
import githubSync from '../integrations/github-sync.js';
import {
  addManualEntry,
  updateEntry,
  deleteManualEntry,
  getManualEntriesByDate,
  getAllManualEntries,
  saveTag,
  getAllTags,
  deleteTag,
  incrementTagUsage,
  getEntriesByTag,
  updateAutomaticSession
} from '../background/manual-entries.js';

// State
let currentSection = 'overview';
let currentDateRange = 'today';
let customStartDate = null;
let customEndDate = null;
let allSessions = [];
let currentStats = null;
let charts = {};
let useDummyData = true;
let employeeProfile = {};
let currentMeetings = [];
let currentGitHubActivities = [];
let currentTimeEntries = [];
let currentTags = [];
let currentEditingEntry = null;
let calendarSettings = {
  autoSync: false
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initializes the dashboard
 */
async function initialize() {
  console.log('Neram Dashboard initializing...');
  setupNavigation();
  setupEventListeners();
  await loadEmployeeProfile();
  await loadSettings();
  await initializeCalendarStatus();
  updateGitHubStatus();
  await loadTagsForFilter();
  await loadData();
  console.log('Dashboard initialized. Current stats:', currentStats);
  console.log('Dummy data enabled:', useDummyData);
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
    timeentries: 'Time Entries',
    meetings: 'Meetings',
    github: 'GitHub',
    settings: 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[section];

  // Load section-specific data
  if (section === 'analytics') {
    // Make sure we have data before loading analytics
    if (currentStats) {
      loadAnalytics();
    }
  } else if (section === 'categories') {
    // Make sure we have data before loading categories
    if (currentStats) {
      loadCategories();
    }
  } else if (section === 'timeentries') {
    loadTimeEntries();
  } else if (section === 'meetings') {
    loadMeetings();
  } else if (section === 'github') {
    loadGitHubActivities();
  }
}

/**
 * Sets up event listeners
 */
function setupEventListeners() {
  // Date range selector
  document.getElementById('dateRange').addEventListener('change', (e) => {
    currentDateRange = e.target.value;

    const customInputs = document.getElementById('customDateInputs');
    if (currentDateRange === 'custom') {
      customInputs.style.display = 'flex';
      // Set default dates
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      document.getElementById('customStartDate').valueAsDate = weekAgo;
      document.getElementById('customEndDate').valueAsDate = today;
    } else {
      customInputs.style.display = 'none';
      loadData();
    }
  });

  // Custom date range apply button
  document.getElementById('applyCustomRange').addEventListener('click', () => {
    const startDate = document.getElementById('customStartDate').valueAsDate;
    const endDate = document.getElementById('customEndDate').valueAsDate;

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      alert('Start date must be before end date');
      return;
    }

    customStartDate = startDate;
    customEndDate = endDate;
    loadData();
  });

  // Dummy data toggle
  document.getElementById('dummyDataToggle').addEventListener('change', (e) => {
    useDummyData = e.target.checked;
    loadData();
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('exportTimesheetBtn').addEventListener('click', exportData);

  // Settings buttons
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('saveSettingsBtnBottom').addEventListener('click', saveSettings);
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
  document.getElementById('addBlacklistBtn').addEventListener('click', addToBlacklist);

  // Collapsible settings sections
  setupCollapsibleSections();

  // Search
  document.getElementById('searchInput').addEventListener('input', filterTable);
  document.getElementById('timesheetSearch').addEventListener('input', filterTimesheetTable);

  // Calendar integration buttons
  document.getElementById('saveGoogleClientIdBtn').addEventListener('click', () => saveClientId('google'));
  document.getElementById('saveMicrosoftClientIdBtn').addEventListener('click', () => saveClientId('microsoft'));
  document.getElementById('connectGoogleBtn').addEventListener('click', connectGoogleCalendar);
  document.getElementById('disconnectGoogleBtn').addEventListener('click', () => disconnectCalendar('google'));
  document.getElementById('connectMicrosoftBtn').addEventListener('click', connectMicrosoftCalendar);
  document.getElementById('disconnectMicrosoftBtn').addEventListener('click', () => disconnectCalendar('microsoft'));
  document.getElementById('refreshMeetingsBtn').addEventListener('click', loadMeetings);
  document.getElementById('exportMeetingsBtn').addEventListener('click', exportMeetings);
  document.getElementById('meetingsSearch').addEventListener('input', filterMeetingsTable);

  // GitHub integration buttons
  document.getElementById('saveGitHubBtn').addEventListener('click', saveGitHubCredentials);
  document.getElementById('disconnectGitHubBtn').addEventListener('click', disconnectGitHub);
  document.getElementById('refreshGitHubBtn').addEventListener('click', loadGitHubActivities);
  document.getElementById('exportGitHubBtn').addEventListener('click', exportGitHubActivities);
  document.getElementById('githubSearch').addEventListener('input', filterGitHubTable);

  // Time entries buttons
  document.getElementById('addManualEntryBtn').addEventListener('click', openAddEntryModal);
  document.getElementById('manageTagsBtn').addEventListener('click', openTagsModal);
  document.getElementById('filterByTag').addEventListener('change', filterEntriesByTag);
  document.getElementById('entriesSearch').addEventListener('input', filterEntriesTable);

  // Modal close buttons
  document.getElementById('closeTimeEntryModal').addEventListener('click', closeTimeEntryModal);
  document.getElementById('cancelTimeEntry').addEventListener('click', closeTimeEntryModal);
  document.getElementById('closeTagsModal').addEventListener('click', closeTagsModal);
  document.getElementById('closeTagsModalBtn').addEventListener('click', closeTagsModal);

  // Form submissions
  document.getElementById('timeEntryForm').addEventListener('submit', handleTimeEntrySubmit);
  document.getElementById('addTagBtn').addEventListener('click', handleAddTag);
}

/**
 * Sets up collapsible settings sections
 */
function setupCollapsibleSections() {
  const collapsibleTitles = document.querySelectorAll('.settings-title-collapsible');

  collapsibleTitles.forEach(title => {
    title.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const group = this.closest('.settings-group-collapsible');

      if (content.style.display === 'none') {
        content.style.display = 'block';
        group.classList.remove('collapsed');
      } else {
        content.style.display = 'none';
        group.classList.add('collapsed');
      }
    });
  });
}

/**
 * Loads data based on current date range
 */
async function loadData() {
  try {
    console.log('Loading data... Dummy data enabled:', useDummyData);
    // Calculate date range
    const { start, end } = getDateRange(currentDateRange);

    if (useDummyData) {
      console.log('Generating dummy data...');
      currentStats = generateComprehensiveDummyData();
      console.log('Dummy data generated:', currentStats);
    } else {
      console.log('Fetching real data...');
      // Try to fetch real data
      currentStats = await fetchRealData(start, end);

      // If no real data, show empty state
      if (!currentStats || currentStats.sessionCount === 0) {
        console.log('No real data found, showing empty state');
        currentStats = generateEmptyStats();
      } else {
        console.log('Real data loaded:', currentStats);
      }
    }

    // Update all sections
    console.log('Updating overview...');
    updateOverview(currentStats);
    console.log('Updating charts...');
    updateCharts(currentStats);
    console.log('Updating table...');
    updateTable(currentStats);

    // Update analytics and categories if they're the current section
    if (currentSection === 'analytics') {
      console.log('Updating analytics section...');
      loadAnalytics();
    } else if (currentSection === 'categories') {
      console.log('Updating categories section...');
      loadCategories();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    currentStats = generateEmptyStats();
    updateOverview(currentStats);
  }
}

/**
 * Generates comprehensive dummy data for visualization
 */
function generateComprehensiveDummyData() {
  // Generate sessions for the past 7 days
  const sessions = [];
  const now = new Date();

  // Different websites with varying time distributions
  const websites = [
    { domain: 'github.com', category: 'Development', avgTime: 90, variance: 30 },
    { domain: 'stackoverflow.com', category: 'Development', avgTime: 45, variance: 20 },
    { domain: 'docs.google.com', category: 'Work & Productivity', avgTime: 60, variance: 25 },
    { domain: 'gmail.com', category: 'Work & Productivity', avgTime: 30, variance: 15 },
    { domain: 'youtube.com', category: 'Entertainment', avgTime: 40, variance: 20 },
    { domain: 'twitter.com', category: 'Social Media', avgTime: 25, variance: 15 },
    { domain: 'linkedin.com', category: 'Work & Productivity', avgTime: 20, variance: 10 },
    { domain: 'slack.com', category: 'Work & Productivity', avgTime: 35, variance: 15 },
    { domain: 'medium.com', category: 'News & Reading', avgTime: 25, variance: 10 },
    { domain: 'figma.com', category: 'Design', avgTime: 50, variance: 20 },
    { domain: 'notion.so', category: 'Work & Productivity', avgTime: 40, variance: 15 },
    { domain: 'reddit.com', category: 'Social Media', avgTime: 20, variance: 10 }
  ];

  // Generate sessions for past 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    // Generate 8-15 sessions per day
    const sessionsPerDay = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i < sessionsPerDay; i++) {
      const site = websites[Math.floor(Math.random() * websites.length)];

      // Random time during work hours (9 AM - 6 PM)
      const hour = 9 + Math.floor(Math.random() * 9);
      const minute = Math.floor(Math.random() * 60);

      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);

      // Duration in minutes with variance
      const durationMinutes = Math.max(
        5,
        site.avgTime + (Math.random() - 0.5) * site.variance * 2
      );
      const duration = durationMinutes * 60 * 1000;

      sessions.push({
        id: sessions.length + 1,
        domain: site.domain,
        category: site.category,
        title: `${site.domain} - Work Session`,
        url: `https://${site.domain}`,
        startTime: startTime.getTime(),
        endTime: startTime.getTime() + duration,
        duration: duration,
        date: startTime.toISOString().split('T')[0]
      });
    }
  }

  // Sort sessions by start time
  sessions.sort((a, b) => b.startTime - a.startTime);

  // Calculate statistics
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

  // Group by domain
  const domainMap = {};
  sessions.forEach(session => {
    if (!domainMap[session.domain]) {
      domainMap[session.domain] = {
        domain: session.domain,
        category: session.category,
        time: 0,
        visits: 0
      };
    }
    domainMap[session.domain].time += session.duration;
    domainMap[session.domain].visits++;
  });

  const topDomains = Object.values(domainMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 10)
    .map(d => ({
      ...d,
      percentage: (d.time / totalTime) * 100
    }));

  // Group by category
  const categoryMap = {};
  sessions.forEach(session => {
    if (!categoryMap[session.category]) {
      categoryMap[session.category] = {
        category: session.category,
        time: 0,
        visitCount: 0
      };
    }
    categoryMap[session.category].time += session.duration;
    categoryMap[session.category].visitCount++;
  });

  const categories = Object.values(categoryMap)
    .sort((a, b) => b.time - a.time)
    .map(c => ({
      ...c,
      percentage: (c.time / totalTime) * 100
    }));

  // Calculate hourly data
  const hourlyData = Array(24).fill(0);
  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourlyData[hour] += session.duration;
  });

  // Calculate daily data
  const dailyMap = {};
  sessions.forEach(session => {
    if (!dailyMap[session.date]) {
      dailyMap[session.date] = { date: session.date, time: 0, sessionCount: 0 };
    }
    dailyMap[session.date].time += session.duration;
    dailyMap[session.date].sessionCount++;
  });

  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Calculate productivity and focus scores
  const productiveCategoryTime = categories
    .filter(c => ['Development', 'Work & Productivity', 'Education & Learning'].includes(c.category))
    .reduce((sum, c) => sum + c.time, 0);

  const productivityScore = Math.round((productiveCategoryTime / totalTime) * 100);

  // Focus score based on average session length and switches
  const avgSessionLength = totalTime / sessions.length;
  const focusScore = Math.min(100, Math.round((avgSessionLength / (30 * 60 * 1000)) * 100));

  return {
    totalTime,
    sessionCount: sessions.length,
    productivityScore,
    focusScore,
    topDomains,
    categories,
    hourlyData,
    dailyData,
    sessions
  };
}

/**
 * Fetches real data from IndexedDB
 */
async function fetchRealData(startTime, endTime) {
  try {
    // Open IndexedDB
    const db = await openDatabase();

    if (!db) {
      console.log('Database not available');
      return generateEmptyStats();
    }

    // Fetch sessions from IndexedDB
    const sessions = await getSessionsFromDB(db, startTime, endTime);

    if (!sessions || sessions.length === 0) {
      console.log('No sessions found in database');
      return generateEmptyStats();
    }

    // Process sessions into stats format
    const stats = processSessionsIntoStats(sessions);
    return stats;
  } catch (error) {
    console.error('Error fetching real data:', error);
    return generateEmptyStats();
  }
}

/**
 * Opens IndexedDB database
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NeramDB', 2); // Updated to version 2

    request.onerror = (event) => {
      console.error('Failed to open database:', event.target.error);
      resolve(null);
    };

    request.onsuccess = () => {
      console.log('Dashboard: Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      // Database schema is managed by service-worker's storage.js
      // This should not fire if service worker already initialized the DB
      console.log('Dashboard: Database upgrade triggered - version', event.oldVersion, 'to', event.newVersion);
      // Just let it proceed, schema should already be created
    };
  });
}

/**
 * Gets sessions from IndexedDB
 */
function getSessionsFromDB(db, startTime, endTime) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('startTime');
      const range = IDBKeyRange.bound(startTime, endTime);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error fetching sessions from DB');
        resolve([]);
      };
    } catch (error) {
      console.error('Error accessing database:', error);
      resolve([]);
    }
  });
}

/**
 * Processes sessions into stats format
 */
function processSessionsIntoStats(sessions) {
  if (!sessions || sessions.length === 0) {
    return generateEmptyStats();
  }

  const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Group by domain
  const domainMap = {};
  sessions.forEach(session => {
    if (!domainMap[session.domain]) {
      domainMap[session.domain] = {
        domain: session.domain,
        category: session.category,
        time: 0,
        visits: 0
      };
    }
    domainMap[session.domain].time += session.duration;
    domainMap[session.domain].visits++;
  });

  const topDomains = Object.values(domainMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 10)
    .map(d => ({
      ...d,
      percentage: totalTime > 0 ? (d.time / totalTime) * 100 : 0
    }));

  // Group by category
  const categoryMap = {};
  sessions.forEach(session => {
    if (!categoryMap[session.category]) {
      categoryMap[session.category] = {
        category: session.category,
        time: 0,
        visitCount: 0
      };
    }
    categoryMap[session.category].time += session.duration;
    categoryMap[session.category].visitCount++;
  });

  const categories = Object.values(categoryMap)
    .sort((a, b) => b.time - a.time)
    .map(c => ({
      ...c,
      percentage: totalTime > 0 ? (c.time / totalTime) * 100 : 0
    }));

  // Calculate hourly data
  const hourlyData = Array(24).fill(0);
  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourlyData[hour] += session.duration;
  });

  // Calculate daily data
  const dailyMap = {};
  sessions.forEach(session => {
    const date = session.date || new Date(session.startTime).toISOString().split('T')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { date, time: 0, sessionCount: 0 };
    }
    dailyMap[date].time += session.duration;
    dailyMap[date].sessionCount++;
  });

  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Calculate productivity score
  const productiveCategoryTime = categories
    .filter(c => ['Development', 'Work & Productivity', 'Education & Learning'].includes(c.category))
    .reduce((sum, c) => sum + c.time, 0);

  const productivityScore = totalTime > 0 ? Math.round((productiveCategoryTime / totalTime) * 100) : 0;

  // Calculate focus score
  const avgSessionLength = totalTime / sessions.length;
  const focusScore = Math.min(100, Math.round((avgSessionLength / (30 * 60 * 1000)) * 100));

  return {
    totalTime,
    sessionCount: sessions.length,
    productivityScore,
    focusScore,
    topDomains,
    categories,
    hourlyData,
    dailyData,
    sessions
  };
}

/**
 * Generates empty stats structure
 */
function generateEmptyStats() {
  return {
    totalTime: 0,
    sessionCount: 0,
    productivityScore: 0,
    focusScore: 0,
    topDomains: [],
    categories: [],
    hourlyData: Array(24).fill(0),
    dailyData: [],
    sessions: []
  };
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

    case 'custom':
      if (customStartDate && customEndDate) {
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      } else {
        // Default to today if custom dates not set
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      }
      break;

    default:
      start = new Date(now);
      end = new Date(now);
  }

  return { start: start.getTime(), end: end.getTime() };
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
  if (stats.totalTime > 0) {
    document.getElementById('totalTimeChange').textContent = '+12% from yesterday';
    document.getElementById('totalTimeChange').className = 'stat-change positive';

    document.getElementById('productivityChange').textContent = '+5% from yesterday';
    document.getElementById('productivityChange').className = 'stat-change positive';

    document.getElementById('focusChange').textContent = '-3% from yesterday';
    document.getElementById('focusChange').className = 'stat-change negative';

    document.getElementById('sessionChange').textContent = '+2 from yesterday';
    document.getElementById('sessionChange').className = 'stat-change positive';
  } else {
    document.getElementById('totalTimeChange').textContent = 'No data';
    document.getElementById('productivityChange').textContent = 'No data';
    document.getElementById('focusChange').textContent = 'No data';
    document.getElementById('sessionChange').textContent = 'No data';
  }
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

  if (stats.dailyData.length === 0) {
    // Show empty state
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
    return;
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

  if (stats.categories.length === 0) {
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  const colors = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#84cc16'
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
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No data available. Enable tracking and start browsing!</td></tr>';
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
        <td>${domain.percentage.toFixed(1)}%</td>
      </tr>
    `;
  }).join('');
}

/**
 * Gets category badge class
 */
function getCategoryClass(category) {
  const productive = ['Development', 'Work & Productivity', 'Education & Learning', 'Design'];
  const unproductive = ['Social Media', 'Entertainment', 'Gaming', 'Shopping'];

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
  updateTimesheetTable();
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

  // Check if we have valid data
  if (!currentStats || !currentStats.hourlyData) {
    return;
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

  // Check if we have valid data
  if (!currentStats || !currentStats.dailyData) {
    return;
  }

  // Generate week data from dailyData
  const weekData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  if (currentStats.dailyData.length > 0) {
    currentStats.dailyData.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      weekData[dayOfWeek] += day.time / (1000 * 60 * 60); // Convert to hours
    });
  }

  charts.weekly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{
        label: 'This Week',
        data: weekData,
        backgroundColor: '#4f46e5'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value.toFixed(1)}h`
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
  const insights = [];

  // Check if we have valid data
  if (!currentStats) {
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '<div class="loading">No data available</div>';
    return;
  }

  if (currentStats.totalTime > 0) {
    const hours = currentStats.totalTime / (1000 * 60 * 60);

    if (currentStats.productivityScore >= 70) {
      insights.push({
        type: 'success',
        title: 'Highly Productive Session',
        message: `Your productivity score is ${currentStats.productivityScore}%. You spent most of your time on productive tasks. Great work!`
      });
    } else if (currentStats.productivityScore < 40) {
      insights.push({
        type: 'warning',
        title: 'Low Productivity Score',
        message: `Your productivity score is ${currentStats.productivityScore}%. Consider reducing time on distracting sites.`
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Balanced Activity',
        message: `Your productivity score is ${currentStats.productivityScore}%. You have a good balance between work and breaks.`
      });
    }

    if (currentStats.focusScore >= 70) {
      insights.push({
        type: 'success',
        title: 'Excellent Focus',
        message: `Your focus score is ${currentStats.focusScore}%. You maintained good concentration with minimal context switching.`
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Improve Focus',
        message: `Your focus score is ${currentStats.focusScore}%. Try to reduce tab switching for better concentration.`
      });
    }

    // Find peak hours
    const peakHour = currentStats.hourlyData.indexOf(Math.max(...currentStats.hourlyData));
    if (peakHour >= 0 && currentStats.hourlyData[peakHour] > 0) {
      insights.push({
        type: 'info',
        title: 'Peak Activity Hour',
        message: `You are most active around ${peakHour}:00. Schedule important tasks during this time.`
      });
    }

    if (currentStats.topDomains.length > 0) {
      const topSite = currentStats.topDomains[0];
      const hours = topSite.time / (1000 * 60 * 60);
      insights.push({
        type: 'info',
        title: 'Most Visited Site',
        message: `You spent ${hours.toFixed(1)} hours on ${topSite.domain} (${topSite.percentage.toFixed(1)}% of your time).`
      });
    }
  } else {
    insights.push({
      type: 'info',
      title: 'No Data Yet',
      message: 'Start browsing to see insights about your activity patterns. Enable tracking and visit some websites!'
    });
  }

  const insightsList = document.getElementById('insightsList');
  insightsList.innerHTML = insights.map(insight => `
    <div class="insight-item ${insight.type}">
      <div class="insight-title">${insight.title}</div>
      <div class="insight-message">${insight.message}</div>
    </div>
  `).join('');
}

/**
 * Updates timesheet table
 */
function updateTimesheetTable() {
  const tbody = document.getElementById('timesheetTableBody');

  // Check if we have valid data and employee profile
  if (!currentStats || !currentStats.sessions || currentStats.sessions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No timesheet data available. Start tracking or enable dummy data.</td></tr>';
    return;
  }

  if (!employeeProfile.empCode || !employeeProfile.empName) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Please configure your employee profile in Settings to view timesheet.</td></tr>';
    return;
  }

  const sessions = currentStats.sessions || [];

  tbody.innerHTML = sessions.map(session => {
    const hours = (session.duration / (1000 * 60 * 60)).toFixed(2);
    const loggedDate = new Date(session.startTime).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });

    const taskDescription = `${session.category} work on ${session.domain}`;

    return `
      <tr>
        <td>${employeeProfile.empCode || 'N/A'}</td>
        <td>${employeeProfile.empName || 'N/A'}</td>
        <td>${employeeProfile.companyCode || 'N/A'}</td>
        <td>${employeeProfile.practice || 'N/A'}</td>
        <td>${employeeProfile.productName || session.category}</td>
        <td>${employeeProfile.projectClient || session.domain}</td>
        <td>${taskDescription}</td>
        <td>${hours}</td>
        <td>${loggedDate}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Filters timesheet table based on search
 */
function filterTimesheetTable() {
  const searchTerm = document.getElementById('timesheetSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#timesheetTableBody tr');

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
 * Loads categories section
 */
function loadCategories() {
  const categoriesGrid = document.getElementById('categoriesGrid');

  if (!currentStats || !currentStats.categories || currentStats.categories.length === 0) {
    categoriesGrid.innerHTML = '<div class="empty-state">No category data available. Start tracking to see breakdown by categories.</div>';
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
        <span>${cat.percentage.toFixed(1)}%</span>
      </div>
      <div class="category-bar">
        <div class="category-bar-fill" style="width: ${cat.percentage}%"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Loads employee profile
 */
async function loadEmployeeProfile() {
  try {
    employeeProfile = await new Promise(resolve => {
      chrome.storage.sync.get({
        empCode: '',
        empName: '',
        companyCode: '',
        practice: '',
        productName: '',
        projectClient: ''
      }, resolve);
    });

    // Populate form fields
    document.getElementById('empCode').value = employeeProfile.empCode || '';
    document.getElementById('empName').value = employeeProfile.empName || '';
    document.getElementById('companyCode').value = employeeProfile.companyCode || '';
    document.getElementById('practice').value = employeeProfile.practice || '';
    document.getElementById('productName').value = employeeProfile.productName || '';
    document.getElementById('projectClient').value = employeeProfile.projectClient || '';
  } catch (error) {
    console.error('Error loading employee profile:', error);
  }
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
    // Save employee profile
    const profile = {
      empCode: document.getElementById('empCode').value,
      empName: document.getElementById('empName').value,
      companyCode: document.getElementById('companyCode').value,
      practice: document.getElementById('practice').value,
      productName: document.getElementById('productName').value,
      projectClient: document.getElementById('projectClient').value
    };

    // Save tracking settings
    const settings = {
      trackingEnabled: document.getElementById('enableTracking').checked,
      idleTimeout: parseInt(document.getElementById('idleTimeout').value),
      focusMode: document.getElementById('enableFocusMode').checked,
      focusModeThreshold: parseInt(document.getElementById('focusThreshold').value),
      blacklist: Array.from(document.querySelectorAll('.blacklist-item')).map(
        item => item.textContent.trim().replace('×', '')
      )
    };

    // Save calendar settings
    calendarSettings.autoSync = document.getElementById('autoSyncMeetings').checked;

    await new Promise(resolve => {
      chrome.storage.sync.set({ ...profile, ...settings }, resolve);
    });

    // Save calendar settings separately (local storage)
    await chrome.storage.local.set({ calendarSettings });

    // Update background script
    chrome.runtime.sendMessage({ type: 'updateSettings', settings });

    employeeProfile = profile;
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
  if (!confirm('Are you sure you want to clear all tracking data? This action cannot be undone.')) {
    return;
  }

  try {
    // This would clear IndexedDB in production
    useDummyData = true;
    document.getElementById('dummyDataToggle').checked = true;
    await loadData();
    alert('All tracking data has been cleared. Dummy data is now displayed.');
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Error clearing data. Please try again.');
  }
}

/**
 * Exports data in the specified CSV format
 * Includes automatic tracking, manual entries, and GitHub activities
 */
async function exportData() {
  try {
    // Check if employee profile is complete
    if (!employeeProfile.empCode || !employeeProfile.empName) {
      alert('Please complete your employee profile in Settings before exporting data.');
      switchSection('settings');
      return;
    }

    // Collect all data sources
    const sessions = currentStats.sessions || [];
    const manualEntries = currentTimeEntries.filter(e => e.isManual) || [];
    const githubActivities = currentGitHubActivities || [];

    const allEntries = [...sessions, ...manualEntries, ...githubActivities];

    if (allEntries.length === 0) {
      alert('No data to export. Start tracking or enable dummy data to see export format.');
      return;
    }

    // CSV Header
    const headers = [
      'Emp Code',
      'Emp Name',
      'Company Code',
      'Practice',
      'Product Name',
      'Project/Client',
      'Task/Description',
      'Working Hours (8H)',
      'Logged Date',
      'Entry Type',
      'Tags'
    ];

    // Convert all entries to CSV rows
    const rows = allEntries.map(entry => {
      const hours = (entry.duration / (1000 * 60 * 60)).toFixed(2);
      const loggedDate = new Date(entry.startTime || entry.timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });

      // Determine entry type and description
      let entryType = 'Browser';
      let taskDescription = '';
      let projectClient = '';

      if (entry.isManual) {
        entryType = 'Manual';
        taskDescription = entry.description || 'Manual time entry';
        projectClient = employeeProfile.projectClient || 'Manual';
      } else if (entry.repository) {
        // GitHub activity
        entryType = 'GitHub';
        taskDescription = entry.description || `${entry.type} on ${entry.repository}`;
        projectClient = entry.repository;
      } else {
        // Automatic browser session
        entryType = entry.isEdited ? 'Browser (Edited)' : 'Browser';
        taskDescription = `${entry.category} work on ${entry.domain}`;
        projectClient = entry.domain;
      }

      const tags = entry.tags ? entry.tags.join(', ') : 'N/A';

      return [
        employeeProfile.empCode || 'N/A',
        employeeProfile.empName || 'N/A',
        employeeProfile.companyCode || 'N/A',
        employeeProfile.practice || 'N/A',
        employeeProfile.productName || entry.category || 'N/A',
        projectClient,
        taskDescription,
        hours,
        loggedDate,
        entryType,
        tags
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const today = new Date().toISOString().split('T')[0];
    link.download = `timesheet_${employeeProfile.empCode}_${today}.csv`;

    link.click();
    URL.revokeObjectURL(url);

    alert(`Data exported successfully! Included ${sessions.length} browser sessions, ${manualEntries.length} manual entries, and ${githubActivities.length} GitHub activities.`);
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

// ===== CALENDAR INTEGRATION FUNCTIONS =====

/**
 * Initialize calendar status on load
 */
async function initializeCalendarStatus() {
  updateCalendarStatus();

  // Load calendar settings
  try {
    const result = await chrome.storage.local.get(['calendarSettings']);
    if (result.calendarSettings) {
      calendarSettings = result.calendarSettings;
      document.getElementById('autoSyncMeetings').checked = calendarSettings.autoSync;
    }
  } catch (error) {
    console.error('Error loading calendar settings:', error);
  }

  // Load and display client IDs
  await loadClientIds();
}

/**
 * Load client IDs from storage and display in UI
 */
async function loadClientIds() {
  try {
    const result = await chrome.storage.local.get(['calendarClientIds']);
    if (result.calendarClientIds) {
      if (result.calendarClientIds.google) {
        document.getElementById('googleClientId').value = result.calendarClientIds.google;
      }
      if (result.calendarClientIds.microsoft) {
        document.getElementById('microsoftClientId').value = result.calendarClientIds.microsoft;
      }
    }
  } catch (error) {
    console.error('Error loading client IDs:', error);
  }
}

/**
 * Save client ID for a provider
 */
async function saveClientId(provider) {
  try {
    const inputId = provider === 'google' ? 'googleClientId' : 'microsoftClientId';
    const clientId = document.getElementById(inputId).value.trim();

    if (!clientId) {
      alert(`Please enter a ${provider === 'google' ? 'Google' : 'Microsoft'} Client ID`);
      return;
    }

    // Validate format
    if (provider === 'google' && !clientId.endsWith('.apps.googleusercontent.com')) {
      alert('Invalid Google Client ID format. It should end with .apps.googleusercontent.com');
      return;
    }

    if (provider === 'microsoft' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)) {
      alert('Invalid Microsoft Client ID format. It should be a GUID (e.g., 12345678-1234-1234-1234-123456789abc)');
      return;
    }

    // Save to calendar sync manager
    const result = await calendarSync.saveClientIds(provider, clientId);

    if (result.success) {
      alert(`${provider === 'google' ? 'Google' : 'Microsoft'} Client ID saved successfully! You can now connect your calendar.`);
    } else {
      alert(`Failed to save Client ID: ${result.error}`);
    }
  } catch (error) {
    console.error('Error saving client ID:', error);
    alert('Failed to save Client ID. Please try again.');
  }
}

/**
 * Update calendar connection status in UI
 */
function updateCalendarStatus() {
  // Google Calendar status
  const googleConnected = calendarSync.isConnected('google');
  const googleStatusCard = document.getElementById('googleStatus');
  const googleStatusText = document.getElementById('googleStatusText');
  const googleCalendarStatus = document.getElementById('googleCalendarStatus');
  const connectGoogleBtn = document.getElementById('connectGoogleBtn');
  const disconnectGoogleBtn = document.getElementById('disconnectGoogleBtn');

  if (googleConnected) {
    googleStatusCard.classList.add('connected');
    googleStatusText.textContent = 'Connected';
    googleCalendarStatus.textContent = 'Connected and syncing';
    connectGoogleBtn.style.display = 'none';
    disconnectGoogleBtn.style.display = 'block';
  } else {
    googleStatusCard.classList.remove('connected');
    googleStatusText.textContent = 'Not Connected';
    googleCalendarStatus.textContent = 'Not connected';
    connectGoogleBtn.style.display = 'block';
    disconnectGoogleBtn.style.display = 'none';
  }

  // Microsoft Calendar status
  const microsoftConnected = calendarSync.isConnected('microsoft');
  const microsoftStatusCard = document.getElementById('microsoftStatus');
  const microsoftStatusText = document.getElementById('microsoftStatusText');
  const microsoftCalendarStatus = document.getElementById('microsoftCalendarStatus');
  const connectMicrosoftBtn = document.getElementById('connectMicrosoftBtn');
  const disconnectMicrosoftBtn = document.getElementById('disconnectMicrosoftBtn');

  if (microsoftConnected) {
    microsoftStatusCard.classList.add('connected');
    microsoftStatusText.textContent = 'Connected';
    microsoftCalendarStatus.textContent = 'Connected and syncing';
    connectMicrosoftBtn.style.display = 'none';
    disconnectMicrosoftBtn.style.display = 'block';
  } else {
    microsoftStatusCard.classList.remove('connected');
    microsoftStatusText.textContent = 'Not Connected';
    microsoftCalendarStatus.textContent = 'Not connected';
    connectMicrosoftBtn.style.display = 'block';
    disconnectMicrosoftBtn.style.display = 'none';
  }
}

/**
 * Connect Google Calendar
 */
async function connectGoogleCalendar() {
  try {
    const btn = document.getElementById('connectGoogleBtn');
    btn.disabled = true;
    btn.textContent = 'Connecting...';

    const result = await calendarSync.authenticateGoogle();

    if (result.success) {
      alert('Google Calendar connected successfully!');
      updateCalendarStatus();
      loadMeetings();
    } else {
      alert(`Failed to connect Google Calendar: ${result.error}`);
    }
  } catch (error) {
    console.error('Error connecting Google Calendar:', error);
    alert('Failed to connect Google Calendar. Please try again.');
  } finally {
    const btn = document.getElementById('connectGoogleBtn');
    btn.disabled = false;
    btn.textContent = 'Connect Google';
  }
}

/**
 * Connect Microsoft Outlook Calendar
 */
async function connectMicrosoftCalendar() {
  try {
    const btn = document.getElementById('connectMicrosoftBtn');
    btn.disabled = true;
    btn.textContent = 'Connecting...';

    const result = await calendarSync.authenticateMicrosoft();

    if (result.success) {
      alert('Microsoft Outlook connected successfully!');
      updateCalendarStatus();
      loadMeetings();
    } else {
      alert(`Failed to connect Microsoft Outlook: ${result.error}`);
    }
  } catch (error) {
    console.error('Error connecting Microsoft Outlook:', error);
    alert('Failed to connect Microsoft Outlook. Please try again.');
  } finally {
    const btn = document.getElementById('connectMicrosoftBtn');
    btn.disabled = false;
    btn.textContent = 'Connect Outlook';
  }
}

/**
 * Disconnect a calendar provider
 */
async function disconnectCalendar(provider) {
  const providerName = provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook';

  if (!confirm(`Are you sure you want to disconnect ${providerName}?`)) {
    return;
  }

  try {
    const result = await calendarSync.disconnect(provider);

    if (result.success) {
      alert(`${providerName} disconnected successfully!`);
      updateCalendarStatus();
      loadMeetings(); // Refresh meetings list
    } else {
      alert(`Failed to disconnect ${providerName}: ${result.error}`);
    }
  } catch (error) {
    console.error(`Error disconnecting ${provider}:`, error);
    alert(`Failed to disconnect ${providerName}. Please try again.`);
  }
}

/**
 * Load and display meetings from connected calendars
 */
async function loadMeetings() {
  try {
    const { start, end } = getDateRange(currentDateRange);

    // Check if any calendar is connected
    if (!calendarSync.isConnected('google') && !calendarSync.isConnected('microsoft')) {
      currentMeetings = [];
      updateMeetingsTable();
      return;
    }

    // Show loading state
    const tbody = document.getElementById('meetingsTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading meetings...</td></tr>';

    // Fetch meetings from all connected calendars
    const meetings = await calendarSync.fetchAllEvents(start, end);

    // Correlate with tracking sessions
    const sessions = currentStats?.sessions || [];
    currentMeetings = await calendarSync.correlateMeetingsWithSessions(meetings, sessions);

    // Update UI
    updateMeetingsTable();
    updateMeetingInsights();

  } catch (error) {
    console.error('Error loading meetings:', error);
    const tbody = document.getElementById('meetingsTableBody');
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading meetings: ${error.message}</td></tr>`;
  }
}

/**
 * Update meetings table
 */
function updateMeetingsTable() {
  const tbody = document.getElementById('meetingsTableBody');

  if (!currentMeetings || currentMeetings.length === 0) {
    const noCalendar = !calendarSync.isConnected('google') && !calendarSync.isConnected('microsoft');

    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <div style="padding: 40px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
          ${noCalendar ? 'No Calendar Connected' : 'No Meetings Found'}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${noCalendar ? 'Connect your Google or Microsoft calendar in Settings to sync meetings' : 'No meetings found for the selected date range'}
        </div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = currentMeetings.map(meeting => {
    const scheduledHours = (meeting.scheduledDuration / (1000 * 60 * 60)).toFixed(2);
    const actualHours = (meeting.actualTimeSpent / (1000 * 60 * 60)).toFixed(2);
    const dateTime = meeting.startTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Determine utilization class
    let utilizationClass = 'utilization-low';
    if (meeting.utilizationRate >= 80) {
      utilizationClass = 'utilization-high';
    } else if (meeting.utilizationRate >= 50) {
      utilizationClass = 'utilization-medium';
    }

    // Attendance status
    const attendanceClass = meeting.attendanceConfirmed ? 'confirmed' : 'unconfirmed';
    const attendanceIcon = meeting.attendanceConfirmed ? '✓' : '?';
    const attendanceText = meeting.attendanceConfirmed ? 'Confirmed' : 'Unconfirmed';

    // Provider badge
    const providerIcon = meeting.provider === 'google' ? '📧' : '📨';

    return `<tr>
      <td><strong>${meeting.title}</strong></td>
      <td>${dateTime}</td>
      <td>${formatDuration(meeting.scheduledDuration)}</td>
      <td>${formatDuration(meeting.actualTimeSpent)}</td>
      <td>
        <span class="attendance-status ${attendanceClass}">
          ${attendanceIcon} ${attendanceText}
        </span>
      </td>
      <td>
        <span class="utilization-badge ${utilizationClass}">
          ${Math.round(meeting.utilizationRate)}%
        </span>
      </td>
      <td>
        <span class="provider-badge">
          ${providerIcon} ${meeting.provider === 'google' ? 'Google' : 'Outlook'}
        </span>
      </td>
      <td>${meeting.attendees || 0}</td>
    </tr>`;
  }).join('');
}

/**
 * Update meeting insights
 */
function updateMeetingInsights() {
  const container = document.getElementById('meetingInsightsList');

  if (!currentMeetings || currentMeetings.length === 0) {
    container.innerHTML = '<div class="loading">Connect a calendar to see meeting insights...</div>';
    return;
  }

  const insights = generateMeetingInsights(currentMeetings);
  container.innerHTML = insights.map(insight => `
    <div class="insight-item ${insight.type}">
      <div class="insight-title">${insight.title}</div>
      <div class="insight-message">${insight.message}</div>
    </div>
  `).join('');
}

/**
 * Generate insights from meetings data
 */
function generateMeetingInsights(meetings) {
  const insights = [];

  // Total meeting time
  const totalScheduled = meetings.reduce((sum, m) => sum + m.scheduledDuration, 0);
  const totalActual = meetings.reduce((sum, m) => sum + m.actualTimeSpent, 0);
  const avgUtilization = meetings.reduce((sum, m) => sum + m.utilizationRate, 0) / meetings.length;

  insights.push({
    type: 'info',
    title: 'Total Meeting Time',
    message: `You had ${meetings.length} meetings scheduled for ${formatDuration(totalScheduled)}. Actual time spent: ${formatDuration(totalActual)}.`
  });

  // Attendance rate
  const attended = meetings.filter(m => m.attendanceConfirmed).length;
  const attendanceRate = (attended / meetings.length) * 100;

  if (attendanceRate >= 80) {
    insights.push({
      type: 'success',
      title: 'Great Meeting Attendance',
      message: `You attended ${attended} out of ${meetings.length} meetings (${Math.round(attendanceRate)}%). Keep it up!`
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Meeting Attendance',
      message: `You attended ${attended} out of ${meetings.length} meetings (${Math.round(attendanceRate)}%). Some meetings may have been missed.`
    });
  }

  // Utilization insights
  if (avgUtilization >= 80) {
    insights.push({
      type: 'success',
      title: 'High Meeting Engagement',
      message: `Average meeting utilization is ${Math.round(avgUtilization)}%. You're actively engaged in your meetings.`
    });
  } else if (avgUtilization < 50) {
    insights.push({
      type: 'warning',
      title: 'Low Meeting Engagement',
      message: `Average meeting utilization is ${Math.round(avgUtilization)}%. You may be multitasking or some meetings ran shorter than scheduled.`
    });
  }

  // Longest meeting
  const longest = meetings.reduce((max, m) => m.scheduledDuration > max.scheduledDuration ? m : max, meetings[0]);
  if (longest.scheduledDuration > 2 * 60 * 60 * 1000) { // > 2 hours
    insights.push({
      type: 'info',
      title: 'Long Meeting Alert',
      message: `Your longest meeting "${longest.title}" was scheduled for ${formatDuration(longest.scheduledDuration)}. Consider breaking long meetings into smaller sessions.`
    });
  }

  return insights;
}

/**
 * Export meetings to CSV
 */
function exportMeetings() {
  try {
    if (!currentMeetings || currentMeetings.length === 0) {
      alert('No meetings to export. Please connect a calendar and load meetings first.');
      return;
    }

    // CSV headers
    const headers = [
      'Meeting Title',
      'Date',
      'Start Time',
      'End Time',
      'Scheduled Duration (Hours)',
      'Actual Time Spent (Hours)',
      'Attendance Status',
      'Utilization %',
      'Provider',
      'Attendees',
      'Organizer'
    ];

    // Generate rows
    const rows = currentMeetings.map(meeting => {
      const scheduledHours = (meeting.scheduledDuration / (1000 * 60 * 60)).toFixed(2);
      const actualHours = (meeting.actualTimeSpent / (1000 * 60 * 60)).toFixed(2);
      const date = meeting.startTime.toLocaleDateString('en-US');
      const startTime = meeting.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const endTime = meeting.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const attendanceStatus = meeting.attendanceConfirmed ? 'Confirmed' : 'Unconfirmed';
      const provider = meeting.provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook';

      return [
        meeting.title,
        date,
        startTime,
        endTime,
        scheduledHours,
        actualHours,
        attendanceStatus,
        Math.round(meeting.utilizationRate),
        provider,
        meeting.attendees || 0,
        meeting.organizer || 'Unknown'
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const today = new Date().toISOString().split('T')[0];
    link.download = `meetings_${employeeProfile.empCode || 'export'}_${today}.csv`;

    link.click();
    URL.revokeObjectURL(url);

    alert('Meetings exported successfully!');
  } catch (error) {
    console.error('Error exporting meetings:', error);
    alert('Error exporting meetings. Please try again.');
  }
}

/**
 * Filter meetings table
 */
function filterMeetingsTable(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#meetingsTable tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// ===== GITHUB INTEGRATION FUNCTIONS =====

/**
 * Save GitHub credentials
 */
async function saveGitHubCredentials() {
  try {
    const username = document.getElementById('githubUsername').value.trim();
    const token = document.getElementById('githubToken').value.trim();

    if (!username) {
      alert('Please enter your GitHub username');
      return;
    }

    if (!token) {
      alert('Please enter your Personal Access Token');
      return;
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      alert('Invalid token format. GitHub Personal Access Tokens start with "ghp_" or "github_pat_"');
      return;
    }

    const result = await githubSync.saveToken(token, username);

    if (result.success) {
      alert('GitHub credentials saved successfully! You can now view your activities in the GitHub tab.');
      updateGitHubStatus();
    } else {
      alert(`Failed to save credentials: ${result.error}`);
    }
  } catch (error) {
    console.error('Error saving GitHub credentials:', error);
    alert('Failed to save credentials. Please try again.');
  }
}

/**
 * Disconnect GitHub
 */
async function disconnectGitHub() {
  if (!confirm('Are you sure you want to disconnect GitHub? Your activities data will be cleared.')) {
    return;
  }

  try {
    const result = await githubSync.disconnect();

    if (result.success) {
      document.getElementById('githubUsername').value = '';
      document.getElementById('githubToken').value = '';
      alert('GitHub disconnected successfully!');
      updateGitHubStatus();
      loadGitHubActivities(); // Refresh to show empty state
    } else {
      alert(`Failed to disconnect: ${result.error}`);
    }
  } catch (error) {
    console.error('Error disconnecting GitHub:', error);
    alert('Failed to disconnect GitHub. Please try again.');
  }
}

/**
 * Update GitHub connection status in UI
 */
function updateGitHubStatus() {
  const isConfigured = githubSync.isConfigured();
  const statusCard = document.getElementById('githubStatus');
  const statusText = document.getElementById('githubStatusText');
  const connectionStatus = document.getElementById('githubConnectionStatus');
  const disconnectBtn = document.getElementById('disconnectGitHubBtn');

  if (isConfigured) {
    statusCard.classList.add('connected');
    statusText.textContent = 'Connected';
    connectionStatus.textContent = `Connected as ${githubSync.username}`;
    disconnectBtn.style.display = 'block';
  } else {
    statusCard.classList.remove('connected');
    statusText.textContent = 'Not Connected';
    connectionStatus.textContent = 'Not connected';
    disconnectBtn.style.display = 'none';
  }
}

/**
 * Load GitHub activities
 */
async function loadGitHubActivities() {
  try {
    const { start, end } = getDateRange(currentDateRange);

    if (!githubSync.isConfigured()) {
      currentGitHubActivities = [];
      updateGitHubTable();
      return;
    }

    const tbody = document.getElementById('githubTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading GitHub activities...</td></tr>';

    // Fetch activities
    const activities = await githubSync.fetchUserEvents(start, end);

    // Correlate with browser sessions
    const sessions = currentStats?.sessions || [];
    currentGitHubActivities = await githubSync.correlateWithSessions(activities, sessions);

    // Update UI
    updateGitHubTable();
    updateGitHubInsights();
  } catch (error) {
    console.error('Error loading GitHub activities:', error);
    const tbody = document.getElementById('githubTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error loading activities: ${error.message}</td></tr>`;
  }
}

/**
 * Update GitHub table
 */
function updateGitHubTable() {
  const tbody = document.getElementById('githubTableBody');

  if (!currentGitHubActivities || currentGitHubActivities.length === 0) {
    const noGitHub = !githubSync.isConfigured();

    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">
      <div style="padding: 40px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🐙</div>
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
          ${noGitHub ? 'No GitHub Connected' : 'No Activities Found'}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${noGitHub ? 'Connect your GitHub account in Settings to sync activities' : 'No GitHub activities found for the selected date range'}
        </div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = currentGitHubActivities.map(activity => {
    const dateTime = activity.timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const typeClass = activity.hasTrackedTime ? 'badge-productive' : 'badge-neutral';

    return `<tr>
      <td>${dateTime}</td>
      <td><span class="badge ${typeClass}">${activity.type}</span></td>
      <td><a href="https://github.com/${activity.repo}" target="_blank" style="color: var(--primary-color);">${activity.repo}</a></td>
      <td>${activity.details || activity.description}</td>
      <td>${formatDuration(activity.estimatedTime)}</td>
      <td>${activity.hasTrackedTime ? formatDuration(activity.trackedTime) : '-'}</td>
    </tr>`;
  }).join('');
}

/**
 * Update GitHub insights
 */
function updateGitHubInsights() {
  const container = document.getElementById('githubInsightsList');

  if (!currentGitHubActivities || currentGitHubActivities.length === 0) {
    container.innerHTML = '<div class="loading">Connect GitHub to see activity insights...</div>';
    return;
  }

  const insights = githubSync.generateInsights(currentGitHubActivities);
  container.innerHTML = insights.map(insight => `
    <div class="insight-item ${insight.type}">
      <div class="insight-title">${insight.title}</div>
      <div class="insight-message">${insight.message}</div>
    </div>
  `).join('');
}

/**
 * Export GitHub activities
 */
function exportGitHubActivities() {
  try {
    if (!currentGitHubActivities || currentGitHubActivities.length === 0) {
      alert('No GitHub activities to export.');
      return;
    }

    const headers = [
      'Date & Time',
      'Type',
      'Repository',
      'Description',
      'Estimated Time (Hours)',
      'Tracked Time (Hours)',
      'URL'
    ];

    const rows = currentGitHubActivities.map(activity => {
      const estimatedHours = (activity.estimatedTime / (1000 * 60 * 60)).toFixed(2);
      const trackedHours = activity.trackedTime ? (activity.trackedTime / (1000 * 60 * 60)).toFixed(2) : '0';
      const dateTime = activity.timestamp.toLocaleString('en-US');

      return [
        dateTime,
        activity.type,
        activity.repo,
        activity.details || activity.description,
        estimatedHours,
        trackedHours,
        activity.url
      ];
    });

    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const today = new Date().toISOString().split('T')[0];
    link.download = `github_activities_${today}.csv`;

    link.click();
    URL.revokeObjectURL(url);

    alert('GitHub activities exported successfully!');
  } catch (error) {
    console.error('Error exporting GitHub activities:', error);
    alert('Error exporting activities. Please try again.');
  }
}

/**
 * Filter GitHub table
 */
function filterGitHubTable(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#githubTable tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// ===== TIME ENTRIES FUNCTIONS =====

/**
 * Load time entries
 */
async function loadTimeEntries() {
  try {
    const { start, end } = getDateRange(currentDateRange);

    // Load manual entries
    const manualEntries = await getManualEntriesByDate(start, end);

    // Combine with automatic sessions
    const automaticSessions = currentStats?.sessions || [];

    // Combine all entries
    currentTimeEntries = [
      ...manualEntries.map(entry => ({
        ...entry,
        isManual: true,
        startTime: new Date(`${entry.date}T${entry.startTime}`).getTime()
      })),
      ...automaticSessions.map(session => ({
        ...session,
        isManual: false
      }))
    ];

    // Sort by start time (newest first)
    currentTimeEntries.sort((a, b) => b.startTime - a.startTime);

    // Load tags and update filter dropdown
    await loadTagsForFilter();

    // Update table
    updateTimeEntriesTable();
  } catch (error) {
    console.error('Error loading time entries:', error);
  }
}

/**
 * Update time entries table
 */
function updateTimeEntriesTable(filteredEntries = null) {
  const tbody = document.getElementById('entriesTableBody');
  const entries = filteredEntries || currentTimeEntries;

  if (!entries || entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No time entries found</td></tr>';
    return;
  }

  tbody.innerHTML = entries.map(entry => {
    const date = new Date(entry.startTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const time = new Date(entry.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const duration = formatDuration(entry.duration);
    const description = entry.description || entry.title || `${entry.category} on ${entry.domain || 'Unknown'}`;
    const category = entry.category || 'Other';
    const tags = entry.tags ? entry.tags.map(tag => `<span class="badge badge-neutral">${tag}</span>`).join(' ') : '-';

    // Determine entry type badge
    let type;
    if (entry.isManual) {
      type = '<span class="badge badge-productive">Manual</span>';
    } else if (entry.isEdited) {
      type = '<span class="badge badge-warning" title="This automatic entry was edited">Auto (Edited) ✏️</span>';
    } else {
      type = '<span class="badge badge-neutral">Auto</span>';
    }

    const actions = `
      <button onclick="editEntry(${entry.id || entry.startTime})" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;">✏️ Edit</button>
      ${entry.isManual ? `<button onclick="deleteEntry(${entry.id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin-left: 4px;">🗑️ Delete</button>` : ''}
    `;

    return `<tr>
      <td>${date}</td>
      <td>${time}</td>
      <td>${duration}</td>
      <td>${description}</td>
      <td>${category}</td>
      <td>${tags}</td>
      <td>${type}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

/**
 * Open add entry modal
 */
function openAddEntryModal() {
  currentEditingEntry = null;
  document.getElementById('timeEntryModalTitle').textContent = 'Add Manual Time Entry';
  document.getElementById('timeEntryForm').reset();

  // Set default date to today
  document.getElementById('entryDate').valueAsDate = new Date();

  document.getElementById('timeEntryModal').style.display = 'flex';
}

/**
 * Open edit entry modal
 */
window.editEntry = async function(entryId) {
  console.log('Edit entry called with ID:', entryId);

  // Find the entry
  const entry = currentTimeEntries.find(e => (e.id || e.startTime) === entryId);

  if (!entry) {
    console.error('Entry not found for ID:', entryId);
    alert('Entry not found');
    return;
  }

  console.log('Found entry:', entry);
  currentEditingEntry = entry;
  document.getElementById('timeEntryModalTitle').textContent = 'Edit Time Entry';

  // Populate form based on entry type
  const startDate = new Date(entry.startTime);

  try {
    document.getElementById('entryDate').valueAsDate = startDate;
    document.getElementById('entryStartTime').value = startDate.toTimeString().slice(0, 5);
    document.getElementById('entryDuration').value = Math.round(entry.duration / (1000 * 60));
    document.getElementById('entryDescription').value = entry.description || entry.title || entry.domain || '';
    document.getElementById('entryCategory').value = entry.category || 'Other';
    document.getElementById('entryTags').value = entry.tags ? entry.tags.join(', ') : '';

    document.getElementById('timeEntryModal').style.display = 'flex';
    console.log('Modal displayed successfully');
  } catch (error) {
    console.error('Error populating form:', error);
    alert('Error opening edit form. Check console for details.');
  }
};

/**
 * Delete entry
 */
window.deleteEntry = async function(entryId) {
  if (!confirm('Are you sure you want to delete this entry?')) {
    return;
  }

  try {
    await deleteManualEntry(entryId);
    alert('Entry deleted successfully!');
    await loadTimeEntries();
  } catch (error) {
    console.error('Error deleting entry:', error);
    alert('Failed to delete entry. Please try again.');
  }
};

/**
 * Close time entry modal
 */
function closeTimeEntryModal() {
  document.getElementById('timeEntryModal').style.display = 'none';
  currentEditingEntry = null;
}

/**
 * Handle time entry form submission
 */
async function handleTimeEntrySubmit(e) {
  e.preventDefault();

  try {
    const date = document.getElementById('entryDate').value;
    const startTimeStr = document.getElementById('entryStartTime').value;
    const durationMinutes = parseInt(document.getElementById('entryDuration').value);
    const description = document.getElementById('entryDescription').value;
    const category = document.getElementById('entryCategory').value;
    const tagsInput = document.getElementById('entryTags').value;

    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    if (currentEditingEntry) {
      // Determine if this is a manual or automatic entry
      const isManualEntry = currentEditingEntry.isManual === true;

      if (isManualEntry) {
        // Update manual entry
        const entry = {
          date,
          startTime: startTimeStr,
          duration: durationMinutes * 60 * 1000,
          description,
          category,
          tags
        };

        await updateEntry(currentEditingEntry.id, entry);
        alert('Manual entry updated successfully!');
      } else {
        // Update automatic session
        // Calculate new start time timestamp
        const [hours, minutes] = startTimeStr.split(':').map(Number);
        const dateObj = new Date(date);
        dateObj.setHours(hours, minutes, 0, 0);
        const newStartTime = dateObj.getTime();

        const updates = {
          startTime: newStartTime,
          endTime: newStartTime + (durationMinutes * 60 * 1000),
          duration: durationMinutes * 60 * 1000,
          title: description, // Use description as title for automatic entries
          category,
          tags,
          date
        };

        await updateAutomaticSession(currentEditingEntry.id, updates);
        alert('Automatic entry updated successfully!');
      }

      // Increment tag usage for new tags
      for (const tag of tags) {
        await incrementTagUsage(tag);
      }
    } else {
      // Add new manual entry
      const entry = {
        date,
        startTime: startTimeStr,
        duration: durationMinutes * 60 * 1000,
        description,
        category,
        tags
      };

      await addManualEntry(entry);
      alert('Entry added successfully!');

      // Increment tag usage
      for (const tag of tags) {
        await incrementTagUsage(tag);
      }
    }

    closeTimeEntryModal();
    await loadTimeEntries();
  } catch (error) {
    console.error('Error saving entry:', error);
    alert('Failed to save entry. Please try again.');
  }
}

/**
 * Filter entries by tag
 */
async function filterEntriesByTag(e) {
  const tagName = e.target.value;

  if (!tagName) {
    // Show all entries
    updateTimeEntriesTable();
    return;
  }

  // Filter entries by tag
  const filteredEntries = currentTimeEntries.filter(entry =>
    entry.tags && entry.tags.includes(tagName)
  );

  updateTimeEntriesTable(filteredEntries);
}

/**
 * Filter entries table by search
 */
function filterEntriesTable(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#entriesTable tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

/**
 * Load tags for filter dropdown
 */
async function loadTagsForFilter() {
  try {
    currentTags = await getAllTags();

    const filterDropdown = document.getElementById('filterByTag');
    filterDropdown.innerHTML = '<option value="">All Tags</option>';

    currentTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag.name;
      option.textContent = `${tag.name} (${tag.usageCount || 0})`;
      filterDropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

// ===== TAGS MANAGEMENT FUNCTIONS =====

/**
 * Open tags modal
 */
async function openTagsModal() {
  document.getElementById('tagsModal').style.display = 'flex';
  await loadTagsList();
}

/**
 * Close tags modal
 */
function closeTagsModal() {
  document.getElementById('tagsModal').style.display = 'none';
}

/**
 * Load tags list
 */
async function loadTagsList() {
  try {
    currentTags = await getAllTags();

    const container = document.getElementById('tagsListContainer');

    if (currentTags.length === 0) {
      container.innerHTML = '<div class="empty-state">No tags yet. Create your first tag above.</div>';
      return;
    }

    container.innerHTML = currentTags.map(tag => `
      <div class="tag-item" style="background-color: ${tag.color};">
        ${tag.name} (${tag.usageCount || 0})
        <button onclick="removeTag('${tag.name}')" title="Delete tag">×</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

/**
 * Handle add tag
 */
async function handleAddTag() {
  try {
    const name = document.getElementById('newTagName').value.trim();
    const color = document.getElementById('newTagColor').value;

    if (!name) {
      alert('Please enter a tag name');
      return;
    }

    // Check if tag already exists
    if (currentTags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      alert('Tag already exists');
      return;
    }

    await saveTag({ name, color });
    document.getElementById('newTagName').value = '';
    document.getElementById('newTagColor').value = '#4f46e5';

    await loadTagsList();
    await loadTagsForFilter();
  } catch (error) {
    console.error('Error adding tag:', error);
    alert('Failed to add tag. Please try again.');
  }
}

/**
 * Remove tag
 */
window.removeTag = async function(tagName) {
  if (!confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
    return;
  }

  try {
    await deleteTag(tagName);
    await loadTagsList();
    await loadTagsForFilter();
  } catch (error) {
    console.error('Error deleting tag:', error);
    alert('Failed to delete tag. Please try again.');
  }
};
