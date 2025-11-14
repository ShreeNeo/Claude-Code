/**
 * Analytics Module
 * Handles data analysis and statistics generation
 */

import { getSessionsByDateRange } from './storage.js';
import { groupByDomain } from '../utils/domain-parser.js';
import { groupByCategory, calculateProductivityScore, getCategoryBreakdown } from '../utils/category-classifier.js';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth } from '../utils/time-formatter.js';

/**
 * Calculates statistics for a given time period
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 * @returns {Promise<Object>} Statistics object
 */
export async function calculateStats(startTime, endTime) {
  const sessions = await getSessionsByDateRange(startTime, endTime);

  if (sessions.length === 0) {
    return {
      totalTime: 0,
      sessionCount: 0,
      domains: [],
      categories: [],
      productivityScore: 0,
      topDomains: [],
      topCategories: []
    };
  }

  const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const domainGroups = groupByDomain(sessions);
  const categoryBreakdown = getCategoryBreakdown(sessions);
  const productivityScore = calculateProductivityScore(sessions);

  // Get top domains
  const topDomains = Object.values(domainGroups)
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 10)
    .map(d => ({
      domain: d.domain,
      totalTime: d.totalTime,
      visitCount: d.visitCount,
      percentage: (d.totalTime / totalTime) * 100
    }));

  // Get top categories
  const topCategories = categoryBreakdown.slice(0, 10);

  return {
    totalTime,
    sessionCount: sessions.length,
    domains: Object.values(domainGroups),
    categories: categoryBreakdown,
    productivityScore,
    topDomains,
    topCategories,
    sessions
  };
}

/**
 * Gets today's statistics
 * @returns {Promise<Object>} Today's stats
 */
export async function getTodayStats() {
  const startTime = getStartOfDay();
  const endTime = getEndOfDay();
  return calculateStats(startTime, endTime);
}

/**
 * Gets this week's statistics
 * @returns {Promise<Object>} This week's stats
 */
export async function getWeekStats() {
  const startTime = getStartOfWeek();
  const endTime = getEndOfWeek();
  return calculateStats(startTime, endTime);
}

/**
 * Gets this month's statistics
 * @returns {Promise<Object>} This month's stats
 */
export async function getMonthStats() {
  const startTime = getStartOfMonth();
  const endTime = getEndOfMonth();
  return calculateStats(startTime, endTime);
}

/**
 * Calculates hourly breakdown for a date range
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 * @returns {Promise<Array>} Hourly breakdown
 */
export async function getHourlyBreakdown(startTime, endTime) {
  const sessions = await getSessionsByDateRange(startTime, endTime);

  // Initialize 24-hour array
  const hourly = Array(24).fill(0);

  for (const session of sessions) {
    if (!session.startTime || !session.duration) continue;

    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime || (session.startTime + session.duration));

    // Distribute session duration across hours
    let currentTime = session.startTime;
    const sessionEnd = session.endTime || (session.startTime + session.duration);

    while (currentTime < sessionEnd) {
      const date = new Date(currentTime);
      const hour = date.getHours();
      const hourEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour + 1, 0, 0).getTime();

      const timeInHour = Math.min(hourEnd, sessionEnd) - currentTime;
      hourly[hour] += timeInHour;

      currentTime = hourEnd;
    }
  }

  return hourly.map((time, hour) => ({
    hour,
    time,
    label: `${hour.toString().padStart(2, '0')}:00`
  }));
}

/**
 * Calculates daily breakdown for a date range
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 * @returns {Promise<Array>} Daily breakdown
 */
export async function getDailyBreakdown(startTime, endTime) {
  const sessions = await getSessionsByDateRange(startTime, endTime);

  const dailyMap = {};

  for (const session of sessions) {
    if (!session.startTime || !session.duration) continue;

    const date = new Date(session.startTime);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!dailyMap[dayKey]) {
      dailyMap[dayKey] = {
        date: dayKey,
        time: 0,
        sessionCount: 0
      };
    }

    dailyMap[dayKey].time += session.duration;
    dailyMap[dayKey].sessionCount++;
  }

  return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Gets trends comparison between two periods
 * @param {number} period1Start - Period 1 start
 * @param {number} period1End - Period 1 end
 * @param {number} period2Start - Period 2 start
 * @param {number} period2End - Period 2 end
 * @returns {Promise<Object>} Trend comparison
 */
export async function getTrendComparison(period1Start, period1End, period2Start, period2End) {
  const [period1Stats, period2Stats] = await Promise.all([
    calculateStats(period1Start, period1End),
    calculateStats(period2Start, period2End)
  ]);

  const timeDiff = period2Stats.totalTime - period1Stats.totalTime;
  const timeChange = period1Stats.totalTime > 0
    ? (timeDiff / period1Stats.totalTime) * 100
    : 0;

  const productivityDiff = period2Stats.productivityScore - period1Stats.productivityScore;

  return {
    period1: period1Stats,
    period2: period2Stats,
    timeDiff,
    timeChange,
    productivityDiff,
    sessionCountDiff: period2Stats.sessionCount - period1Stats.sessionCount
  };
}

/**
 * Generates insights based on user data
 * @param {Object} stats - Statistics object
 * @returns {Array<Object>} Array of insights
 */
export function generateInsights(stats) {
  const insights = [];

  // Total time insight
  if (stats.totalTime > 0) {
    const hours = stats.totalTime / (1000 * 60 * 60);
    if (hours > 8) {
      insights.push({
        type: 'warning',
        title: 'High Screen Time',
        message: `You spent ${hours.toFixed(1)} hours online. Consider taking breaks.`
      });
    } else if (hours < 2) {
      insights.push({
        type: 'success',
        title: 'Low Screen Time',
        message: `Great! You only spent ${hours.toFixed(1)} hours online.`
      });
    }
  }

  // Productivity insight
  if (stats.productivityScore >= 70) {
    insights.push({
      type: 'success',
      title: 'Highly Productive',
      message: `Your productivity score is ${stats.productivityScore}%. Keep it up!`
    });
  } else if (stats.productivityScore < 40) {
    insights.push({
      type: 'warning',
      title: 'Low Productivity',
      message: `Your productivity score is ${stats.productivityScore}%. Try focusing on work-related tasks.`
    });
  }

  // Top site insight
  if (stats.topDomains && stats.topDomains.length > 0) {
    const topSite = stats.topDomains[0];
    const hours = topSite.totalTime / (1000 * 60 * 60);
    insights.push({
      type: 'info',
      title: 'Most Visited Site',
      message: `You spent ${hours.toFixed(1)} hours on ${topSite.domain} (${topSite.percentage.toFixed(1)}% of your time).`
    });
  }

  // Category distribution insight
  if (stats.topCategories && stats.topCategories.length > 0) {
    const topCategory = stats.topCategories[0];
    insights.push({
      type: 'info',
      title: 'Top Category',
      message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your browsing time.`
    });
  }

  return insights;
}

/**
 * Calculates focus score based on context switching
 * @param {Array<Object>} sessions - Array of sessions
 * @returns {number} Focus score (0-100)
 */
export function calculateFocusScore(sessions) {
  if (sessions.length === 0) return 0;

  // Count domain switches
  let switches = 0;
  let previousDomain = null;

  for (const session of sessions) {
    if (previousDomain && session.domain !== previousDomain) {
      switches++;
    }
    previousDomain = session.domain;
  }

  // Calculate average session length
  const avgSessionLength = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
  const avgMinutes = avgSessionLength / (1000 * 60);

  // Score based on switches (fewer is better) and session length (longer is better)
  const switchScore = Math.max(0, 100 - (switches * 2));
  const lengthScore = Math.min(100, avgMinutes * 5);

  return Math.round((switchScore + lengthScore) / 2);
}
