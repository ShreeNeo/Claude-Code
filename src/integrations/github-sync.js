/**
 * GitHub Integration Module
 * Tracks GitHub activities like commits, PRs, issues, and code reviews
 */

/**
 * GitHub Sync Manager
 */
class GitHubSyncManager {
  constructor() {
    this.token = null;
    this.username = null;
    this.loadFromStorage();
  }

  /**
   * Load GitHub token and username from storage
   */
  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get(['githubToken', 'githubUsername']);
      if (result.githubToken) {
        this.token = result.githubToken;
      }
      if (result.githubUsername) {
        this.username = result.githubUsername;
      }
    } catch (error) {
      console.error('Error loading GitHub credentials:', error);
    }
  }

  /**
   * Save GitHub Personal Access Token
   */
  async saveToken(token, username) {
    try {
      this.token = token;
      this.username = username;
      await chrome.storage.local.set({ githubToken: token, githubUsername: username });
      return { success: true };
    } catch (error) {
      console.error('Error saving GitHub token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if GitHub is configured
   */
  isConfigured() {
    return !!this.token && !!this.username;
  }

  /**
   * Disconnect GitHub
   */
  async disconnect() {
    try {
      this.token = null;
      this.username = null;
      await chrome.storage.local.remove(['githubToken', 'githubUsername']);
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch GitHub events for a user
   */
  async fetchUserEvents(startDate, endDate) {
    if (!this.isConfigured()) {
      throw new Error('GitHub not configured. Please add your Personal Access Token in settings.');
    }

    try {
      // GitHub API: Get user events
      const response = await fetch(`https://api.github.com/users/${this.username}/events`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const events = await response.json();

      // Filter events by date range and parse them
      return this.parseGitHubEvents(events, startDate, endDate);
    } catch (error) {
      console.error('Error fetching GitHub events:', error);
      throw error;
    }
  }

  /**
   * Parse GitHub events into standardized format
   */
  parseGitHubEvents(events, startDate, endDate) {
    const activities = [];

    // Sort events by timestamp for better duration estimation
    const sortedEvents = events.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    sortedEvents.forEach((event, index) => {
      const eventDate = new Date(event.created_at);

      // Filter by date range
      if (eventDate < startDate || eventDate > endDate) {
        return;
      }

      // Get next event time for better duration estimation
      const nextEvent = sortedEvents[index + 1];
      const nextEventDate = nextEvent ? new Date(nextEvent.created_at) : null;

      let activity = {
        id: event.id,
        type: this.mapEventType(event.type),
        timestamp: eventDate,
        repo: event.repo?.name || 'Unknown',
        url: this.extractUrl(event),
        description: this.createDescription(event),
        duration: this.estimateDuration(event, nextEventDate)
      };

      // Add type-specific details
      switch (event.type) {
        case 'PushEvent':
          activity.commits = event.payload?.commits?.length || 0;
          activity.details = `${activity.commits} commit${activity.commits !== 1 ? 's' : ''} to ${event.payload?.ref?.replace('refs/heads/', '') || 'branch'}`;
          break;
        case 'PullRequestEvent':
          activity.action = event.payload?.action;
          activity.prNumber = event.payload?.pull_request?.number;
          activity.prTitle = event.payload?.pull_request?.title;
          activity.details = `${activity.action} PR #${activity.prNumber}: ${activity.prTitle}`;
          break;
        case 'IssuesEvent':
          activity.action = event.payload?.action;
          activity.issueNumber = event.payload?.issue?.number;
          activity.issueTitle = event.payload?.issue?.title;
          activity.details = `${activity.action} issue #${activity.issueNumber}: ${activity.issueTitle}`;
          break;
        case 'PullRequestReviewEvent':
          activity.action = event.payload?.action;
          activity.prNumber = event.payload?.pull_request?.number;
          activity.details = `${activity.action} review on PR #${activity.prNumber}`;
          break;
        case 'PullRequestReviewCommentEvent':
          activity.details = `Commented on PR review`;
          break;
        case 'IssueCommentEvent':
          activity.details = `Commented on issue/PR`;
          break;
        case 'CreateEvent':
          activity.refType = event.payload?.ref_type;
          activity.details = `Created ${activity.refType}: ${event.payload?.ref || ''}`;
          break;
        case 'DeleteEvent':
          activity.refType = event.payload?.ref_type;
          activity.details = `Deleted ${activity.refType}: ${event.payload?.ref || ''}`;
          break;
      }

      activities.push(activity);
    });

    return activities;
  }

  /**
   * Map GitHub event types to friendly names
   */
  mapEventType(eventType) {
    const typeMap = {
      'PushEvent': 'Commit',
      'PullRequestEvent': 'Pull Request',
      'IssuesEvent': 'Issue',
      'PullRequestReviewEvent': 'Code Review',
      'PullRequestReviewCommentEvent': 'Review Comment',
      'IssueCommentEvent': 'Comment',
      'CreateEvent': 'Create',
      'DeleteEvent': 'Delete',
      'ForkEvent': 'Fork',
      'WatchEvent': 'Star',
      'ReleaseEvent': 'Release'
    };

    return typeMap[eventType] || eventType;
  }

  /**
   * Extract URL from event
   */
  extractUrl(event) {
    if (event.payload?.pull_request?.html_url) {
      return event.payload.pull_request.html_url;
    }
    if (event.payload?.issue?.html_url) {
      return event.payload.issue.html_url;
    }
    if (event.repo?.name) {
      return `https://github.com/${event.repo.name}`;
    }
    return 'https://github.com';
  }

  /**
   * Create human-readable description
   */
  createDescription(event) {
    const repo = event.repo?.name || 'repository';
    const type = this.mapEventType(event.type);

    switch (event.type) {
      case 'PushEvent':
        const commits = event.payload?.commits?.length || 0;
        return `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${repo}`;
      case 'PullRequestEvent':
        return `${event.payload?.action} pull request in ${repo}`;
      case 'IssuesEvent':
        return `${event.payload?.action} issue in ${repo}`;
      case 'PullRequestReviewEvent':
        return `Reviewed pull request in ${repo}`;
      case 'PullRequestReviewCommentEvent':
        return `Commented on PR review in ${repo}`;
      case 'IssueCommentEvent':
        return `Commented in ${repo}`;
      default:
        return `${type} in ${repo}`;
    }
  }

  /**
   * Estimate duration for different activity types (in milliseconds)
   * Uses intelligent estimation based on event type, commits, and time between events
   */
  estimateDuration(event, nextEventDate) {
    const eventType = event.type;
    const eventDate = new Date(event.created_at);

    // Base durations for different activities (more realistic)
    const baseDurations = {
      'PushEvent': 10 * 60 * 1000,              // 10 minutes base per commit session
      'PullRequestEvent': 20 * 60 * 1000,       // 20 minutes base for PR
      'IssuesEvent': 8 * 60 * 1000,             // 8 minutes for issue
      'PullRequestReviewEvent': 20 * 60 * 1000, // 20 minutes for code review
      'PullRequestReviewCommentEvent': 5 * 60 * 1000, // 5 minutes for review comment
      'IssueCommentEvent': 3 * 60 * 1000,       // 3 minutes for comment
      'CreateEvent': 5 * 60 * 1000,             // 5 minutes for branch creation
      'DeleteEvent': 1 * 60 * 1000,             // 1 minute for deletion
      'ForkEvent': 2 * 60 * 1000,               // 2 minutes for fork
      'WatchEvent': 1 * 60 * 1000,              // 1 minute for starring
      'ReleaseEvent': 15 * 60 * 1000            // 15 minutes for release
    };

    let estimatedDuration = baseDurations[eventType] || 10 * 60 * 1000;

    // Adjust for PushEvent based on number of commits
    if (eventType === 'PushEvent') {
      const commits = event.payload?.commits?.length || 1;
      // Each commit adds 5-10 minutes
      const commitFactor = Math.min(commits, 10); // Cap at 10 commits for estimation
      estimatedDuration = (5 + commitFactor * 5) * 60 * 1000;
    }

    // Adjust for PullRequestEvent based on action
    if (eventType === 'PullRequestEvent') {
      const action = event.payload?.action;
      if (action === 'opened') {
        estimatedDuration = 30 * 60 * 1000; // 30 min to create PR
      } else if (action === 'closed' || action === 'merged') {
        estimatedDuration = 10 * 60 * 1000; // 10 min to merge/close
      } else if (action === 'synchronize') {
        estimatedDuration = 15 * 60 * 1000; // 15 min to update PR
      }
    }

    // Adjust for IssuesEvent based on action
    if (eventType === 'IssuesEvent') {
      const action = event.payload?.action;
      if (action === 'opened') {
        estimatedDuration = 10 * 60 * 1000; // 10 min to create issue
      } else if (action === 'closed') {
        estimatedDuration = 3 * 60 * 1000; // 3 min to close issue
      }
    }

    // If we have the next event, use time difference but cap it
    if (nextEventDate) {
      const timeBetweenEvents = eventDate - nextEventDate;

      // Only use time difference if it's reasonable (between 1 min and 3 hours)
      const minDuration = 1 * 60 * 1000;   // 1 minute minimum
      const maxDuration = 180 * 60 * 1000; // 3 hours maximum

      if (timeBetweenEvents > minDuration && timeBetweenEvents < maxDuration) {
        // Use 70% of time between events as a heuristic
        // (assuming some time for breaks, context switching)
        estimatedDuration = Math.round(timeBetweenEvents * 0.7);
      }
    }

    // Apply min/max bounds
    const minBound = 1 * 60 * 1000;   // 1 minute minimum
    const maxBound = 120 * 60 * 1000; // 2 hours maximum

    return Math.max(minBound, Math.min(estimatedDuration, maxBound));
  }

  /**
   * Correlate GitHub activities with browser tracking sessions
   */
  async correlateWithSessions(activities, sessions) {
    return activities.map(activity => {
      // Find browser sessions around the GitHub activity time
      // Look for sessions within 1 hour before/after the activity
      const timeWindow = 60 * 60 * 1000; // 1 hour
      const activityTime = activity.timestamp.getTime();

      const relatedSessions = sessions.filter(session => {
        const sessionStart = new Date(session.startTime).getTime();
        const sessionEnd = sessionStart + session.duration;

        // Check if session overlaps with activity time window
        return (
          (sessionStart >= activityTime - timeWindow && sessionStart <= activityTime + timeWindow) ||
          (sessionEnd >= activityTime - timeWindow && sessionEnd <= activityTime + timeWindow) ||
          (sessionStart <= activityTime && sessionEnd >= activityTime)
        );
      });

      // Calculate actual tracked time on GitHub during this period
      const githubSessions = relatedSessions.filter(s =>
        s.domain && (s.domain.includes('github.com') || (s.url && s.url.includes('github.com')))
      );

      const trackedTime = githubSessions.reduce((total, s) => total + s.duration, 0);

      // Use tracked time if available and reasonable, otherwise use estimate
      let finalEstimatedTime = activity.duration;

      // If we have significant tracked time on GitHub, use a blend
      if (trackedTime > 0) {
        // Use tracked time but add some buffer for local work
        // GitHub time + 50% for local coding/testing
        finalEstimatedTime = Math.round(trackedTime * 1.5);

        // But cap it at a reasonable maximum
        const maxEstimate = 120 * 60 * 1000; // 2 hours
        finalEstimatedTime = Math.min(finalEstimatedTime, maxEstimate);
      }

      return {
        ...activity,
        trackedTime,
        estimatedTime: finalEstimatedTime,
        hasTrackedTime: trackedTime > 0,
        relatedSessions: relatedSessions.map(s => ({
          domain: s.domain,
          duration: s.duration,
          category: s.category
        }))
      };
    });
  }

  /**
   * Generate GitHub activity insights
   */
  generateInsights(activities) {
    const insights = [];

    // Total activities
    const totalActivities = activities.length;
    insights.push({
      type: 'info',
      title: 'GitHub Activity',
      message: `You had ${totalActivities} GitHub ${totalActivities === 1 ? 'activity' : 'activities'} in this period.`
    });

    // Activity breakdown
    const typeCount = {};
    activities.forEach(a => {
      typeCount[a.type] = (typeCount[a.type] || 0) + 1;
    });

    const topTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topTypes.length > 0) {
      insights.push({
        type: 'info',
        title: 'Most Common Activities',
        message: topTypes.map(([type, count]) => `${type}: ${count}`).join(', ')
      });
    }

    // Tracked vs estimated time
    const totalTracked = activities.reduce((sum, a) => sum + (a.trackedTime || 0), 0);
    const totalEstimated = activities.reduce((sum, a) => sum + a.estimatedTime, 0);

    if (totalTracked > 0) {
      insights.push({
        type: 'success',
        title: 'Time Tracking',
        message: `Browser tracked ${this.formatDuration(totalTracked)} on GitHub. Estimated total: ${this.formatDuration(totalEstimated)}.`
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'No Browser Activity Tracked',
        message: 'No GitHub.com browser activity was tracked during these activities. Consider using web-based GitHub more often.'
      });
    }

    // Most active repository
    const repoCount = {};
    activities.forEach(a => {
      repoCount[a.repo] = (repoCount[a.repo] || 0) + 1;
    });

    const topRepo = Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0];
    if (topRepo) {
      insights.push({
        type: 'info',
        title: 'Most Active Repository',
        message: `${topRepo[0]} (${topRepo[1]} ${topRepo[1] === 1 ? 'activity' : 'activities'})`
      });
    }

    return insights;
  }

  /**
   * Format duration to readable string
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }
}

// Export singleton instance
const githubSync = new GitHubSyncManager();
export default githubSync;
