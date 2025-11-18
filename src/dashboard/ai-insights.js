/**
 * AI Insights Component for Dashboard
 * Displays productivity insights powered by Chrome AI or smart rules
 */

import { generateProductivityInsights, getAIStatus } from '../ai/auto-categorize.js';

/**
 * Render AI insights section
 */
export async function renderAIInsights(activities, container, timeRange = 'week') {
  if (!container) return;

  // Get AI status
  const aiStatus = getAIStatus();

  // Generate insights
  const insightsData = await generateProductivityInsights(activities, timeRange);

  // Build HTML
  const html = `
    <div class="ai-insights-container">
      <div class="insights-header">
        <h3>
          <span class="insights-icon">🤖</span>
          AI Productivity Insights
        </h3>
        <span class="ai-badge ${aiStatus.method === 'chrome-ai' ? 'chrome-ai' : 'smart-rules'}">
          ${aiStatus.method === 'chrome-ai' ? '✨ Chrome AI' : '📊 Smart Rules'}
        </span>
      </div>

      ${insightsData.productivityScore !== undefined ? `
        <div class="productivity-score">
          <div class="score-circle ${getScoreClass(insightsData.productivityScore)}">
            <span class="score-value">${insightsData.productivityScore}%</span>
            <span class="score-label">Productive</span>
          </div>
          <div class="score-description">
            ${getScoreDescription(insightsData.productivityScore)}
          </div>
        </div>
      ` : ''}

      <div class="insights-list">
        ${insightsData.insights.map(insight => `
          <div class="insight-card">
            <div class="insight-text">${insight}</div>
          </div>
        `).join('')}
      </div>

      ${insightsData.summary ? `
        <div class="insights-summary">
          <h4>This ${timeRange}'s Summary</h4>
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="stat-value">${Math.round(insightsData.summary.totalTime)}h</span>
              <span class="stat-label">Total Time</span>
            </div>
            <div class="summary-stat">
              <span class="stat-value">${insightsData.summary.focusSessions}</span>
              <span class="stat-label">Deep Work Sessions</span>
            </div>
            <div class="summary-stat">
              <span class="stat-value">${insightsData.summary.topCategories.slice(0, 2).join(', ')}</span>
              <span class="stat-label">Top Categories</span>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = html;
  addInsightsStyles();
}

/**
 * Get score class based on productivity percentage
 */
function getScoreClass(score) {
  if (score >= 70) return 'excellent';
  if (score >= 50) return 'good';
  if (score >= 30) return 'fair';
  return 'needs-improvement';
}

/**
 * Get score description
 */
function getScoreDescription(score) {
  if (score >= 70) return 'Excellent! You\'re highly productive.';
  if (score >= 50) return 'Good work! Keep it up.';
  if (score >= 30) return 'Room for improvement. Try blocking distractions.';
  return 'Focus on deep work sessions to boost productivity.';
}

/**
 * Add AI insights styles
 */
function addInsightsStyles() {
  const styleId = 'ai-insights-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .ai-insights-container {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
      border: 2px solid rgba(99, 102, 241, 0.2);
      border-radius: 16px;
      padding: 2rem;
      margin: 2rem 0;
    }

    .insights-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .insights-header h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .insights-icon {
      font-size: 1.75rem;
    }

    .ai-badge {
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .ai-badge.chrome-ai {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }

    .ai-badge.smart-rules {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 2px solid rgba(99, 102, 241, 0.3);
    }

    .productivity-score {
      display: flex;
      align-items: center;
      gap: 2rem;
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 6px solid;
      flex-shrink: 0;
    }

    .score-circle.excellent {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .score-circle.good {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
    }

    .score-circle.fair {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }

    .score-circle.needs-improvement {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .score-value {
      font-size: 2rem;
      font-weight: 900;
      color: #0f172a;
    }

    .score-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
    }

    .score-description {
      flex: 1;
      font-size: 1.125rem;
      color: #475569;
      line-height: 1.6;
    }

    .insights-list {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .insight-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #6366f1;
      transition: all 0.2s;
    }

    .insight-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }

    .insight-text {
      font-size: 1rem;
      color: #1e293b;
      line-height: 1.6;
    }

    .insights-summary {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .insights-summary h4 {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 1rem 0;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
    }

    .summary-stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .productivity-score {
        flex-direction: column;
        text-align: center;
      }

      .score-description {
        text-align: center;
      }

      .summary-stats {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

export default {
  renderAIInsights
};
