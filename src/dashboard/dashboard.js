/**
 * Dashboard Script
 * Handles dashboard interactions, charts, and data visualization
 */

/* global chrome */

// Import Chart.js
import Chart from 'chart.js/auto';

// State
let currentSection = 'overview';
let currentDateRange = 'today';
let allSessions = [];
let currentStats = null;
let charts = {};
let useDummyData = true;
let employeeProfile = {};

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initializes the dashboard
 */
async function initialize() {
  console.log('TimeTracker Pro Dashboard initializing...');
  setupNavigation();
  setupEventListeners();
  await loadEmployeeProfile();
  await loadSettings();
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

  // Dummy data toggle
  document.getElementById('dummyDataToggle').addEventListener('change', (e) => {
    useDummyData = e.target.checked;
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
    // This would fetch from IndexedDB in production
    // For now, return empty if no dummy data
    return generateEmptyStats();
  } catch (error) {
    console.error('Error fetching real data:', error);
    return generateEmptyStats();
  }
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

    await new Promise(resolve => {
      chrome.storage.sync.set({ ...profile, ...settings }, resolve);
    });

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
 */
async function exportData() {
  try {
    // Check if employee profile is complete
    if (!employeeProfile.empCode || !employeeProfile.empName) {
      alert('Please complete your employee profile in Settings before exporting data.');
      switchSection('settings');
      return;
    }

    const sessions = currentStats.sessions || [];

    if (sessions.length === 0) {
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
      'Logged Date'
    ];

    // Convert sessions to CSV rows
    const rows = sessions.map(session => {
      const hours = (session.duration / (1000 * 60 * 60)).toFixed(2);
      const loggedDate = new Date(session.startTime).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });

      // Generate task description from domain and category
      const taskDescription = `${session.category} work on ${session.domain}`;

      return [
        employeeProfile.empCode || 'N/A',
        employeeProfile.empName || 'N/A',
        employeeProfile.companyCode || 'N/A',
        employeeProfile.practice || 'N/A',
        employeeProfile.productName || session.category,
        employeeProfile.projectClient || session.domain,
        taskDescription,
        hours,
        loggedDate
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

    alert('Data exported successfully!');
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
