/**
 * Category Classifier Utility
 * Automatically categorizes websites based on domain patterns
 */

// Category definitions with domain patterns and keywords
const CATEGORY_PATTERNS = {
  'Development': {
    domains: [
      'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
      'stackexchange.com', 'developer.mozilla.org', 'npmjs.com',
      'pypi.org', 'packagist.org', 'crates.io', 'rubygems.org',
      'replit.com', 'codepen.io', 'jsfiddle.net', 'codesandbox.io',
      'glitch.com', 'heroku.com', 'vercel.com', 'netlify.com',
      'aws.amazon.com', 'cloud.google.com', 'azure.microsoft.com',
      'digitalocean.com', 'docker.com', 'kubernetes.io'
    ],
    keywords: ['dev', 'code', 'git', 'programming', 'api', 'docs']
  },
  'Work & Productivity': {
    domains: [
      'gmail.com', 'outlook.com', 'mail.google.com', 'office.com',
      'docs.google.com', 'drive.google.com', 'dropbox.com',
      'notion.so', 'evernote.com', 'trello.com', 'asana.com',
      'slack.com', 'teams.microsoft.com', 'zoom.us', 'meet.google.com',
      'calendar.google.com', 'calendly.com', 'airtable.com',
      'monday.com', 'clickup.com', 'basecamp.com', 'jira.atlassian.com',
      'confluence.atlassian.com'
    ],
    keywords: ['mail', 'email', 'calendar', 'meeting', 'document', 'spreadsheet']
  },
  'Social Media': {
    domains: [
      'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
      'linkedin.com', 'reddit.com', 'tiktok.com', 'snapchat.com',
      'pinterest.com', 'tumblr.com', 'whatsapp.com', 'telegram.org',
      'discord.com', 'mastodon.social', 'threads.net'
    ],
    keywords: ['social', 'chat', 'message', 'post', 'share']
  },
  'Entertainment': {
    domains: [
      'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com',
      'twitch.tv', 'spotify.com', 'soundcloud.com', 'pandora.com',
      'primevideo.com', 'hbomax.com', 'crunchyroll.com',
      'vimeo.com', 'dailymotion.com'
    ],
    keywords: ['video', 'music', 'stream', 'watch', 'play', 'entertainment']
  },
  'News & Reading': {
    domains: [
      'nytimes.com', 'wsj.com', 'theguardian.com', 'bbc.com',
      'cnn.com', 'reuters.com', 'apnews.com', 'medium.com',
      'substack.com', 'news.ycombinator.com', 'techcrunch.com',
      'arstechnica.com', 'theverge.com', 'wired.com',
      'flipboard.com', 'feedly.com', 'pocket.getpocket.com'
    ],
    keywords: ['news', 'article', 'blog', 'read', 'journal', 'magazine']
  },
  'Education & Learning': {
    domains: [
      'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org',
      'udacity.com', 'pluralsight.com', 'skillshare.com',
      'linkedin.com/learning', 'codecademy.com', 'freecodecamp.org',
      'brilliant.org', 'duolingo.com', 'quizlet.com',
      'wikipedia.org', 'scholar.google.com', 'arxiv.org',
      'researchgate.net', 'academia.edu'
    ],
    keywords: ['learn', 'course', 'education', 'tutorial', 'study', 'university', 'college']
  },
  'Shopping': {
    domains: [
      'amazon.com', 'ebay.com', 'etsy.com', 'aliexpress.com',
      'walmart.com', 'target.com', 'bestbuy.com', 'newegg.com',
      'shopify.com', 'wayfair.com', 'ikea.com', 'zappos.com'
    ],
    keywords: ['shop', 'store', 'buy', 'cart', 'product', 'order']
  },
  'Gaming': {
    domains: [
      'steam.com', 'epicgames.com', 'gog.com', 'itch.io',
      'minecraft.net', 'roblox.com', 'fortnite.com',
      'leagueoflegends.com', 'battle.net', 'ea.com',
      'ubisoft.com', 'nintendo.com', 'playstation.com',
      'xbox.com'
    ],
    keywords: ['game', 'gaming', 'play', 'player']
  },
  'Search': {
    domains: [
      'google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com',
      'ask.com', 'baidu.com', 'yandex.com', 'ecosia.org'
    ],
    keywords: ['search']
  },
  'Finance': {
    domains: [
      'bloomberg.com', 'marketwatch.com', 'investing.com',
      'tradingview.com', 'morningstar.com', 'yahoo.com/finance',
      'coinbase.com', 'binance.com', 'kraken.com',
      'mint.com', 'personalcapital.com', 'ynab.com'
    ],
    keywords: ['finance', 'invest', 'stock', 'crypto', 'trading', 'money']
  },
  'Design': {
    domains: [
      'figma.com', 'canva.com', 'sketch.com', 'adobe.com',
      'behance.net', 'dribbble.com', 'awwwards.com',
      'unsplash.com', 'pexels.com', 'flaticon.com',
      'fontawesome.com', 'fonts.google.com'
    ],
    keywords: ['design', 'graphics', 'photo', 'illustration', 'creative']
  }
};

// Productivity scoring
const PRODUCTIVE_CATEGORIES = ['Development', 'Work & Productivity', 'Education & Learning'];
const NEUTRAL_CATEGORIES = ['News & Reading', 'Search', 'Finance', 'Design'];
const UNPRODUCTIVE_CATEGORIES = ['Social Media', 'Entertainment', 'Gaming', 'Shopping'];

/**
 * Classifies a domain into a category
 * @param {string} domain - Domain to classify
 * @returns {string} Category name
 */
export function classifyDomain(domain) {
  if (!domain || domain === 'unknown' || domain === 'browser') {
    return 'Other';
  }

  const domainLower = domain.toLowerCase();

  // Check exact domain matches first
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.domains.some(d => domainLower.includes(d))) {
      return category;
    }
  }

  // Check keyword matches
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.keywords.some(k => domainLower.includes(k))) {
      return category;
    }
  }

  return 'Other';
}

/**
 * Gets productivity score for a category
 * @param {string} category - Category name
 * @returns {number} Score from -1 (unproductive) to 1 (productive)
 */
export function getCategoryProductivityScore(category) {
  if (PRODUCTIVE_CATEGORIES.includes(category)) {
    return 1;
  }
  if (NEUTRAL_CATEGORIES.includes(category)) {
    return 0;
  }
  if (UNPRODUCTIVE_CATEGORIES.includes(category)) {
    return -1;
  }
  return 0; // Other category is neutral
}

/**
 * Gets productivity score for a domain
 * @param {string} domain - Domain to score
 * @returns {number} Score from -1 to 1
 */
export function getDomainProductivityScore(domain) {
  const category = classifyDomain(domain);
  return getCategoryProductivityScore(category);
}

/**
 * Calculates overall productivity score from sessions
 * @param {Array<Object>} sessions - Array of session objects with domain and duration
 * @returns {number} Overall productivity score (0-100)
 */
export function calculateProductivityScore(sessions) {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  let totalTime = 0;
  let weightedScore = 0;

  for (const session of sessions) {
    const duration = session.duration || 0;
    const score = getDomainProductivityScore(session.domain);

    totalTime += duration;
    weightedScore += score * duration;
  }

  if (totalTime === 0) {
    return 0;
  }

  // Normalize to 0-100 scale
  const normalizedScore = (weightedScore / totalTime + 1) / 2;
  return Math.round(normalizedScore * 100);
}

/**
 * Groups sessions by category
 * @param {Array<Object>} sessions - Array of session objects
 * @returns {Object} Sessions grouped by category
 */
export function groupByCategory(sessions) {
  const grouped = {};

  for (const session of sessions) {
    const category = classifyDomain(session.domain);

    if (!grouped[category]) {
      grouped[category] = {
        category,
        sessions: [],
        totalTime: 0,
        visitCount: 0,
        productivityScore: getCategoryProductivityScore(category)
      };
    }

    grouped[category].sessions.push(session);
    grouped[category].totalTime += session.duration || 0;
    grouped[category].visitCount++;
  }

  return grouped;
}

/**
 * Gets category breakdown with percentages
 * @param {Array<Object>} sessions - Array of session objects
 * @returns {Array<Object>} Category breakdown
 */
export function getCategoryBreakdown(sessions) {
  const grouped = groupByCategory(sessions);
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  return Object.values(grouped).map(cat => ({
    category: cat.category,
    totalTime: cat.totalTime,
    visitCount: cat.visitCount,
    percentage: totalTime > 0 ? (cat.totalTime / totalTime) * 100 : 0,
    productivityScore: cat.productivityScore
  })).sort((a, b) => b.totalTime - a.totalTime);
}

/**
 * Gets top domains in a category
 * @param {string} category - Category name
 * @param {Array<Object>} sessions - Array of session objects
 * @param {number} limit - Number of top domains to return
 * @returns {Array<Object>} Top domains in category
 */
export function getTopDomainsInCategory(category, sessions, limit = 5) {
  const categoryDomains = {};

  for (const session of sessions) {
    const sessionCategory = classifyDomain(session.domain);

    if (sessionCategory === category) {
      if (!categoryDomains[session.domain]) {
        categoryDomains[session.domain] = {
          domain: session.domain,
          totalTime: 0,
          visitCount: 0
        };
      }

      categoryDomains[session.domain].totalTime += session.duration || 0;
      categoryDomains[session.domain].visitCount++;
    }
  }

  return Object.values(categoryDomains)
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, limit);
}

/**
 * Gets all available categories
 * @returns {Array<string>} Array of category names
 */
export function getAllCategories() {
  return [...Object.keys(CATEGORY_PATTERNS), 'Other'];
}

/**
 * Adds custom category mapping
 * @param {string} domain - Domain to map
 * @param {string} category - Category to assign
 * @param {Object} customMappings - Custom mappings object
 */
export function addCustomCategoryMapping(domain, category, customMappings = {}) {
  customMappings[domain] = category;
  return customMappings;
}

/**
 * Classifies domain with custom mappings
 * @param {string} domain - Domain to classify
 * @param {Object} customMappings - Custom category mappings
 * @returns {string} Category name
 */
export function classifyDomainWithCustom(domain, customMappings = {}) {
  // Check custom mappings first
  if (customMappings[domain]) {
    return customMappings[domain];
  }

  // Fall back to default classification
  return classifyDomain(domain);
}
