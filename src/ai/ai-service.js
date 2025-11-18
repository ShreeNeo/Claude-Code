/**
 * AI Service - Chrome Built-in AI with Smart Rule Fallback
 * Uses Chrome's Gemini Nano when available, falls back to intelligent rules
 */

class AIService {
  constructor() {
    this.chromeAI = null;
    this.isAvailable = false;
    this.isInitializing = false;
    this.initPromise = null;
  }

  /**
   * Initialize AI service - check for Chrome AI availability
   */
  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._checkChromeAI();
    await this.initPromise;
    this.isInitializing = false;

    return this.isAvailable;
  }

  /**
   * Check if Chrome's built-in AI is available
   */
  async _checkChromeAI() {
    try {
      // Check if window.ai is available (Chrome 127+)
      if (typeof window !== 'undefined' && window.ai && window.ai.languageModel) {
        const capabilities = await window.ai.languageModel.capabilities();

        if (capabilities.available === 'readily') {
          this.chromeAI = await window.ai.languageModel.create();
          this.isAvailable = true;
          console.log('✅ Chrome AI (Gemini Nano) initialized successfully');
          return true;
        } else if (capabilities.available === 'after-download') {
          console.log('⏳ Chrome AI available after download');
          // Could potentially trigger download, but for now fall back to rules
        }
      }
    } catch (error) {
      console.log('ℹ️ Chrome AI not available, using smart rules:', error.message);
    }

    this.isAvailable = false;
    console.log('📊 Using rule-based AI features');
    return false;
  }

  /**
   * Categorize activity using AI or rules
   */
  async categorizeActivity(domain, title = '', url = '') {
    if (this.chromeAI) {
      return await this._categorizeWithChromeAI(domain, title, url);
    } else {
      return this._categorizeWithRules(domain, title, url);
    }
  }

  /**
   * Use Chrome AI for categorization
   */
  async _categorizeWithChromeAI(domain, title, url) {
    try {
      const prompt = `Categorize this website activity into ONE category:
Domain: ${domain}
Title: ${title}
URL: ${url}

Categories: Work, Development, Learning, Social, Entertainment, Shopping, News, Communication, Productivity, Research, Other

Respond with ONLY the category name, nothing else.`;

      const response = await this.chromeAI.prompt(prompt);
      const category = response.trim();

      // Validate response
      const validCategories = ['Work', 'Development', 'Learning', 'Social', 'Entertainment', 'Shopping', 'News', 'Communication', 'Productivity', 'Research', 'Other'];
      if (validCategories.includes(category)) {
        return {
          category,
          confidence: 0.9,
          method: 'chrome-ai'
        };
      }
    } catch (error) {
      console.warn('Chrome AI categorization failed, using rules:', error);
    }

    // Fallback to rules if AI fails
    return this._categorizeWithRules(domain, title, url);
  }

  /**
   * Rule-based categorization (smart fallback)
   */
  _categorizeWithRules(domain, title, url) {
    const lowerDomain = domain.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerUrl = url.toLowerCase();
    const combined = `${lowerDomain} ${lowerTitle} ${lowerUrl}`;

    // Development
    if (this._matchPatterns(combined, [
      'github', 'gitlab', 'stackoverflow', 'stackexchange', 'codepen', 'codesandbox',
      'jsfiddle', 'replit', 'localhost', '127.0.0.1', 'developer.mozilla',
      'npmjs', 'pypi', 'docker', 'kubernetes', 'aws.amazon', 'cloud.google',
      'azure.microsoft', 'vercel', 'netlify', 'heroku'
    ])) {
      return { category: 'Development', confidence: 0.95, method: 'rules' };
    }

    // Learning
    if (this._matchPatterns(combined, [
      'udemy', 'coursera', 'edx', 'pluralsight', 'lynda', 'skillshare',
      'khanacademy', 'codecademy', 'freecodecamp', 'tutorial', 'learn',
      'course', 'education', 'university', 'edu', 'documentation', 'docs'
    ])) {
      return { category: 'Learning', confidence: 0.9, method: 'rules' };
    }

    // Communication
    if (this._matchPatterns(combined, [
      'gmail', 'outlook', 'mail', 'slack', 'teams', 'zoom', 'meet.google',
      'discord', 'telegram', 'whatsapp', 'messenger', 'skype'
    ])) {
      return { category: 'Communication', confidence: 0.95, method: 'rules' };
    }

    // Social
    if (this._matchPatterns(combined, [
      'facebook', 'twitter', 'instagram', 'linkedin', 'reddit', 'tiktok',
      'snapchat', 'pinterest', 'tumblr', 'mastodon', 'threads'
    ])) {
      return { category: 'Social', confidence: 0.95, method: 'rules' };
    }

    // Entertainment
    if (this._matchPatterns(combined, [
      'youtube', 'netflix', 'hulu', 'disney', 'twitch', 'spotify',
      'soundcloud', 'video', 'music', 'gaming', 'game', 'entertainment'
    ])) {
      return { category: 'Entertainment', confidence: 0.9, method: 'rules' };
    }

    // News
    if (this._matchPatterns(combined, [
      'news', 'bbc', 'cnn', 'nytimes', 'guardian', 'reuters', 'bloomberg',
      'techcrunch', 'hackernews', 'medium', 'substack'
    ])) {
      return { category: 'News', confidence: 0.9, method: 'rules' };
    }

    // Shopping
    if (this._matchPatterns(combined, [
      'amazon', 'ebay', 'etsy', 'shopify', 'aliexpress', 'walmart',
      'target', 'shop', 'store', 'buy', 'cart', 'checkout'
    ])) {
      return { category: 'Shopping', confidence: 0.85, method: 'rules' };
    }

    // Productivity
    if (this._matchPatterns(combined, [
      'notion', 'trello', 'asana', 'jira', 'monday', 'airtable',
      'docs.google', 'office', 'calendar', 'drive', 'dropbox', 'onedrive'
    ])) {
      return { category: 'Productivity', confidence: 0.9, method: 'rules' };
    }

    // Research
    if (this._matchPatterns(combined, [
      'google', 'bing', 'duckduckgo', 'scholar', 'research', 'wikipedia',
      'archive', 'library', 'journal', 'paper'
    ])) {
      return { category: 'Research', confidence: 0.8, method: 'rules' };
    }

    // Default
    return { category: 'Other', confidence: 0.5, method: 'rules' };
  }

  /**
   * Helper to match patterns
   */
  _matchPatterns(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Generate productivity insights using AI or rules
   */
  async generateInsights(activities, timeRange = 'week') {
    if (this.chromeAI) {
      return await this._generateInsightsWithChromeAI(activities, timeRange);
    } else {
      return this._generateInsightsWithRules(activities, timeRange);
    }
  }

  /**
   * Generate insights with Chrome AI
   */
  async _generateInsightsWithChromeAI(activities, timeRange) {
    try {
      const summary = this._summarizeActivities(activities);

      const prompt = `Analyze this ${timeRange}'s productivity data and provide 3-5 actionable insights:

Total Time: ${summary.totalTime} hours
Most Used Categories: ${summary.topCategories.join(', ')}
Most Visited Sites: ${summary.topSites.join(', ')}
Peak Hours: ${summary.peakHours.join(', ')}

Provide insights as a JSON array of strings, each insight should be concise and actionable.
Example: ["You're most productive in the afternoon", "Consider blocking social media during work hours"]

Respond with ONLY the JSON array.`;

      const response = await this.chromeAI.prompt(prompt);
      const insights = JSON.parse(response);

      return {
        insights,
        method: 'chrome-ai',
        summary
      };
    } catch (error) {
      console.warn('Chrome AI insights failed, using rules:', error);
      return this._generateInsightsWithRules(activities, timeRange);
    }
  }

  /**
   * Generate insights with rules
   */
  _generateInsightsWithRules(activities, timeRange) {
    const summary = this._summarizeActivities(activities);
    const insights = [];

    // Productivity score insight
    const productiveCategories = ['Development', 'Learning', 'Work', 'Productivity', 'Research'];
    const productiveTime = summary.categoryTime
      .filter(c => productiveCategories.includes(c.category))
      .reduce((sum, c) => sum + c.time, 0);
    const productivityScore = Math.round((productiveTime / summary.totalTime) * 100);

    if (productivityScore > 70) {
      insights.push(`🎯 Great productivity! ${productivityScore}% of your time was spent on focused work.`);
    } else if (productivityScore > 40) {
      insights.push(`📊 Moderate productivity at ${productivityScore}%. Consider blocking distractions during focus hours.`);
    } else {
      insights.push(`⚠️ Productivity is ${productivityScore}%. Try time-blocking for deep work sessions.`);
    }

    // Peak hours insight
    if (summary.peakHours.length > 0) {
      insights.push(`⏰ Your peak productive hours are ${summary.peakHours.join(', ')}. Schedule important tasks then.`);
    }

    // Distraction insight
    const distractionCategories = ['Social', 'Entertainment'];
    const distractionTime = summary.categoryTime
      .filter(c => distractionCategories.includes(c.category))
      .reduce((sum, c) => sum + c.time, 0);
    const distractionPercentage = Math.round((distractionTime / summary.totalTime) * 100);

    if (distractionPercentage > 30) {
      insights.push(`📱 ${distractionPercentage}% of time on social/entertainment. Consider using focus mode.`);
    }

    // Focus time insight
    const longSessions = summary.focusSessions;
    if (longSessions > 5) {
      insights.push(`🔥 Excellent focus! You had ${longSessions} deep work sessions this ${timeRange}.`);
    }

    // Learning insight
    const learningTime = summary.categoryTime.find(c => c.category === 'Learning');
    if (learningTime && learningTime.time > 5) {
      insights.push(`📚 Great job! You spent ${Math.round(learningTime.time)} hours learning this ${timeRange}.`);
    }

    return {
      insights,
      method: 'rules',
      summary,
      productivityScore
    };
  }

  /**
   * Summarize activities for analysis
   */
  _summarizeActivities(activities) {
    const categoryTime = {};
    const siteTime = {};
    const hourlyActivity = Array(24).fill(0);
    let totalTime = 0;
    let focusSessions = 0;

    activities.forEach(activity => {
      const time = activity.duration || 0;
      totalTime += time;

      // Category time
      const category = activity.category || 'Other';
      categoryTime[category] = (categoryTime[category] || 0) + time;

      // Site time
      const domain = activity.domain || activity.url;
      siteTime[domain] = (siteTime[domain] || 0) + time;

      // Hourly distribution
      if (activity.timestamp) {
        const hour = new Date(activity.timestamp).getHours();
        hourlyActivity[hour] += time;
      }

      // Focus sessions (>30 min continuous)
      if (time > 30) {
        focusSessions++;
      }
    });

    // Top categories
    const topCategories = Object.entries(categoryTime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    // Top sites
    const topSites = Object.entries(siteTime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([site]) => site);

    // Peak hours (top 3 productive hours)
    const peakHours = hourlyActivity
      .map((time, hour) => ({ hour, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 3)
      .filter(h => h.time > 0)
      .map(h => {
        const hour = h.hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}${period}`;
      });

    return {
      totalTime: totalTime / 60, // Convert to hours
      categoryTime: Object.entries(categoryTime).map(([category, time]) => ({
        category,
        time: time / 60
      })),
      topCategories,
      topSites,
      peakHours,
      focusSessions
    };
  }

  /**
   * Get AI status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      method: this.isAvailable ? 'chrome-ai' : 'rules',
      initialized: !this.isInitializing
    };
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;
