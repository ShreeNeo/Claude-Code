/**
 * Calendar Integration Module
 * Handles OAuth authentication and calendar data fetching for Google Calendar and Microsoft Outlook
 */

// Calendar providers
const PROVIDERS = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft'
};

// OAuth configuration
const OAUTH_CONFIG = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    calendarApiUrl: 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['Calendars.Read'],
    calendarApiUrl: 'https://graph.microsoft.com/v1.0/me/events'
  }
};

/**
 * Calendar Sync Manager
 */
class CalendarSyncManager {
  constructor() {
    this.tokens = {
      google: null,
      microsoft: null
    };
    this.clientIds = {
      google: null,
      microsoft: null
    };
    this.loadTokensFromStorage();
    this.loadClientIdsFromStorage();
  }

  /**
   * Load saved tokens from Chrome storage
   */
  async loadTokensFromStorage() {
    try {
      const result = await chrome.storage.local.get(['calendarTokens']);
      if (result.calendarTokens) {
        this.tokens = result.calendarTokens;
      }
    } catch (error) {
      console.error('Error loading calendar tokens:', error);
    }
  }

  /**
   * Load saved client IDs from Chrome storage
   */
  async loadClientIdsFromStorage() {
    try {
      const result = await chrome.storage.local.get(['calendarClientIds']);
      if (result.calendarClientIds) {
        this.clientIds = result.calendarClientIds;
      }
    } catch (error) {
      console.error('Error loading calendar client IDs:', error);
    }
  }

  /**
   * Save client IDs to Chrome storage
   */
  async saveClientIds(provider, clientId) {
    try {
      this.clientIds[provider] = clientId;
      await chrome.storage.local.set({ calendarClientIds: this.clientIds });
      return { success: true };
    } catch (error) {
      console.error('Error saving client ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if client ID is configured for a provider
   */
  hasClientId(provider) {
    return !!this.clientIds[provider];
  }

  /**
   * Get client ID for a provider
   */
  getClientId(provider) {
    return this.clientIds[provider];
  }

  /**
   * Save tokens to Chrome storage
   */
  async saveTokensToStorage() {
    try {
      await chrome.storage.local.set({ calendarTokens: this.tokens });
    } catch (error) {
      console.error('Error saving calendar tokens:', error);
    }
  }

  /**
   * Authenticate with Google Calendar
   */
  async authenticateGoogle() {
    try {
      // Check if client ID is configured
      if (!this.hasClientId('google')) {
        return {
          success: false,
          error: 'Please configure your Google Client ID in settings first. See setup guide for instructions.'
        };
      }

      // Use Chrome Identity API for OAuth
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      });

      this.tokens.google = token;
      await this.saveTokensToStorage();
      return { success: true, provider: PROVIDERS.GOOGLE };
    } catch (error) {
      console.error('Google authentication failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Authenticate with Microsoft Outlook
   */
  async authenticateMicrosoft() {
    try {
      // Check if client ID is configured
      if (!this.hasClientId('microsoft')) {
        return {
          success: false,
          error: 'Please configure your Microsoft Client ID in settings first. See setup guide for instructions.'
        };
      }

      // For Microsoft, we need to use a custom OAuth flow
      const clientId = this.getClientId('microsoft');
      const redirectUri = chrome.identity.getRedirectURL('microsoft');
      const scopes = OAUTH_CONFIG.microsoft.scopes.join(' ');

      const authUrl = `${OAUTH_CONFIG.microsoft.authUrl}?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

      const responseUrl = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive: true },
          (responseUrl) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(responseUrl);
            }
          }
        );
      });

      // Extract token from response URL
      const token = this.extractTokenFromUrl(responseUrl);

      this.tokens.microsoft = token;
      await this.saveTokensToStorage();
      return { success: true, provider: PROVIDERS.MICROSOFT };
    } catch (error) {
      console.error('Microsoft authentication failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract access token from OAuth redirect URL
   */
  extractTokenFromUrl(url) {
    const params = new URLSearchParams(url.split('#')[1]);
    return params.get('access_token');
  }

  /**
   * Disconnect a calendar provider
   */
  async disconnect(provider) {
    try {
      if (provider === PROVIDERS.GOOGLE && this.tokens.google) {
        // Revoke Google token
        await chrome.identity.removeCachedAuthToken({ token: this.tokens.google });
        this.tokens.google = null;
      } else if (provider === PROVIDERS.MICROSOFT) {
        this.tokens.microsoft = null;
      }

      await this.saveTokensToStorage();
      return { success: true };
    } catch (error) {
      console.error('Disconnect failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a provider is connected
   */
  isConnected(provider) {
    return !!this.tokens[provider];
  }

  /**
   * Fetch Google Calendar events
   */
  async fetchGoogleEvents(startDate, endDate) {
    if (!this.tokens.google) {
      throw new Error('Google Calendar not connected');
    }

    try {
      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();

      const url = `${OAUTH_CONFIG.google.calendarApiUrl}?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.tokens.google}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseGoogleEvents(data.items || []);
    } catch (error) {
      console.error('Error fetching Google events:', error);
      throw error;
    }
  }

  /**
   * Fetch Microsoft Outlook events
   */
  async fetchMicrosoftEvents(startDate, endDate) {
    if (!this.tokens.microsoft) {
      throw new Error('Microsoft Outlook not connected');
    }

    try {
      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();

      const url = `${OAUTH_CONFIG.microsoft.calendarApiUrl}?$filter=start/dateTime ge '${timeMin}' and end/dateTime le '${timeMax}'&$orderby=start/dateTime`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.tokens.microsoft}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseMicrosoftEvents(data.value || []);
    } catch (error) {
      console.error('Error fetching Microsoft events:', error);
      throw error;
    }
  }

  /**
   * Parse Google Calendar events into standard format
   */
  parseGoogleEvents(events) {
    return events.map(event => ({
      id: event.id,
      title: event.summary || 'Untitled Meeting',
      description: event.description || '',
      startTime: new Date(event.start.dateTime || event.start.date),
      endTime: new Date(event.end.dateTime || event.end.date),
      duration: this.calculateDuration(
        new Date(event.start.dateTime || event.start.date),
        new Date(event.end.dateTime || event.end.date)
      ),
      attendees: (event.attendees || []).length,
      isAllDay: !event.start.dateTime,
      provider: PROVIDERS.GOOGLE,
      meetingUrl: this.extractMeetingUrl(event.description || '', event.hangoutLink),
      organizer: event.organizer?.email || 'Unknown'
    }));
  }

  /**
   * Parse Microsoft Outlook events into standard format
   */
  parseMicrosoftEvents(events) {
    return events.map(event => ({
      id: event.id,
      title: event.subject || 'Untitled Meeting',
      description: event.bodyPreview || '',
      startTime: new Date(event.start.dateTime),
      endTime: new Date(event.end.dateTime),
      duration: this.calculateDuration(
        new Date(event.start.dateTime),
        new Date(event.end.dateTime)
      ),
      attendees: (event.attendees || []).length,
      isAllDay: event.isAllDay || false,
      provider: PROVIDERS.MICROSOFT,
      meetingUrl: this.extractMeetingUrl(event.bodyPreview || '', event.onlineMeetingUrl),
      organizer: event.organizer?.emailAddress?.address || 'Unknown'
    }));
  }

  /**
   * Calculate duration in milliseconds
   */
  calculateDuration(startTime, endTime) {
    return endTime.getTime() - startTime.getTime();
  }

  /**
   * Extract meeting URL from description or direct link
   */
  extractMeetingUrl(description, directLink) {
    if (directLink) return directLink;

    // Common meeting URL patterns
    const patterns = [
      /https?:\/\/meet\.google\.com\/[a-z\-]+/i,
      /https?:\/\/teams\.microsoft\.com\/[^\s]+/i,
      /https?:\/\/zoom\.us\/[^\s]+/i,
      /https?:\/\/.*\.webex\.com\/[^\s]+/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) return match[0];
    }

    return null;
  }

  /**
   * Fetch all events from all connected calendars
   */
  async fetchAllEvents(startDate, endDate) {
    const allEvents = [];

    try {
      if (this.isConnected(PROVIDERS.GOOGLE)) {
        const googleEvents = await this.fetchGoogleEvents(startDate, endDate);
        allEvents.push(...googleEvents);
      }
    } catch (error) {
      console.error('Failed to fetch Google events:', error);
    }

    try {
      if (this.isConnected(PROVIDERS.MICROSOFT)) {
        const microsoftEvents = await this.fetchMicrosoftEvents(startDate, endDate);
        allEvents.push(...microsoftEvents);
      }
    } catch (error) {
      console.error('Failed to fetch Microsoft events:', error);
    }

    // Sort by start time
    allEvents.sort((a, b) => a.startTime - b.startTime);

    return allEvents;
  }

  /**
   * Correlate calendar meetings with browser tracking sessions
   * Matches meetings with browser activity during the same time period
   */
  async correlateMeetingsWithSessions(meetings, sessions) {
    return meetings.map(meeting => {
      // Find sessions that overlap with the meeting time
      const overlappingSessions = sessions.filter(session => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.startTime + session.duration);

        return (
          (sessionStart >= meeting.startTime && sessionStart < meeting.endTime) ||
          (sessionEnd > meeting.startTime && sessionEnd <= meeting.endTime) ||
          (sessionStart <= meeting.startTime && sessionEnd >= meeting.endTime)
        );
      });

      // Calculate actual time spent (from browser tracking)
      const actualTimeSpent = overlappingSessions.reduce((total, session) => {
        const sessionStart = Math.max(new Date(session.startTime).getTime(), meeting.startTime.getTime());
        const sessionEnd = Math.min(
          new Date(session.startTime + session.duration).getTime(),
          meeting.endTime.getTime()
        );
        return total + Math.max(0, sessionEnd - sessionStart);
      }, 0);

      // Check if meeting URL was visited
      const meetingUrlVisited = meeting.meetingUrl && overlappingSessions.some(
        session => session.url && session.url.includes(meeting.meetingUrl.split('?')[0])
      );

      return {
        ...meeting,
        actualTimeSpent,
        scheduledDuration: meeting.duration,
        attendanceConfirmed: meetingUrlVisited || actualTimeSpent > 0,
        utilizationRate: meeting.duration > 0 ? (actualTimeSpent / meeting.duration) * 100 : 0,
        relatedSessions: overlappingSessions.map(s => ({
          domain: s.domain,
          duration: s.duration,
          category: s.category
        }))
      };
    });
  }
}

// Export singleton instance
const calendarSync = new CalendarSyncManager();
export default calendarSync;
