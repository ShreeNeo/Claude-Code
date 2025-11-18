/**
 * Auto-Categorize Module
 * Automatically categorizes activities using AI
 */

import aiService from './ai-service.js';

/**
 * Initialize AI service
 */
export async function initializeAI() {
  try {
    await aiService.initialize();
    const status = aiService.getStatus();
    console.log(`AI Service initialized: ${status.method}`);
    return status;
  } catch (error) {
    console.error('Failed to initialize AI service:', error);
    return { available: false, method: 'rules', initialized: false };
  }
}

/**
 * Auto-categorize a session
 */
export async function categorizeSession(session) {
  try {
    const domain = session.domain || extractDomain(session.url);
    const title = session.title || '';
    const url = session.url || '';

    const result = await aiService.categorizeActivity(domain, title, url);

    return {
      ...session,
      category: result.category,
      categoryConfidence: result.confidence,
      categoryMethod: result.method
    };
  } catch (error) {
    console.error('Failed to categorize session:', error);
    return {
      ...session,
      category: 'Other',
      categoryConfidence: 0.5,
      categoryMethod: 'error-fallback'
    };
  }
}

/**
 * Batch categorize multiple sessions
 */
export async function categorizeSessions(sessions) {
  const results = [];

  for (const session of sessions) {
    const categorized = await categorizeSession(session);
    results.push(categorized);
  }

  return results;
}

/**
 * Generate insights from activities
 */
export async function generateProductivityInsights(activities, timeRange = 'week') {
  try {
    const insights = await aiService.generateInsights(activities, timeRange);
    return insights;
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return {
      insights: ['Unable to generate insights at this time.'],
      method: 'error',
      summary: null
    };
  }
}

/**
 * Get AI service status
 */
export function getAIStatus() {
  return aiService.getStatus();
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url;
  }
}

/**
 * Suggest category for a domain (for manual override)
 */
export async function suggestCategory(domain) {
  try {
    const result = await aiService.categorizeActivity(domain, '', '');
    return result;
  } catch (error) {
    console.error('Failed to suggest category:', error);
    return { category: 'Other', confidence: 0.5, method: 'error' };
  }
}

export default {
  initializeAI,
  categorizeSession,
  categorizeSessions,
  generateProductivityInsights,
  getAIStatus,
  suggestCategory
};
