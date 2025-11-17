# Neram

A comprehensive browser extension for tracking time spent on websites with detailed analytics, productivity insights, and **calendar integration** to sync and track meetings from Google Calendar and Microsoft Outlook.

## Features

### Core Functionality
- **Automatic Time Tracking**: Tracks time spent on each website automatically
- **Tab Activity Monitoring**: Monitors active tab and switches
- **Idle Detection**: Automatically pauses tracking when user is idle
- **Domain Grouping**: Groups subdomains intelligently (e.g., mail.google.com → google.com)
- **Privacy-Focused**: All data stored locally, no external servers

### Analytics & Insights
- **Productivity Scoring**: Calculates productivity based on website categories
- **Focus Score**: Measures concentration based on context switching
- **Category Breakdown**: Automatically categorizes websites (Development, Social Media, etc.)
- **Hourly Heatmap**: Visualizes activity patterns throughout the day
- **Daily/Weekly/Monthly Stats**: Track trends over time
- **Smart Insights**: AI-powered recommendations based on your usage patterns

### User Interface
- **Quick Stats Popup**: View current session and today's stats at a glance
- **Comprehensive Dashboard**: Detailed analytics with interactive charts
- **Beautiful Charts**: Powered by Chart.js for smooth visualizations
- **Responsive Design**: Works perfectly on all screen sizes

### Advanced Features
- **Focus Mode**: Get alerts when spending too much time on distracting sites
- **Blacklist**: Exclude specific domains from tracking
- **Data Export**: Export your data as JSON/CSV for timesheet reporting
- **Employee Timesheet**: Professional timesheet export with employee details
- **Custom Categories**: Assign custom categories to domains
- **Data Retention**: Automatically cleans up data older than 90 days
- **Settings Sync**: Settings synchronized across devices (via chrome.storage.sync)

### 🆕 New Integrations & Features (v1.2.0)
- **BYOC Calendar Integration**: 📅 Sync meetings from Google Calendar and Microsoft Outlook (100% FREE)
- **GitHub Integration**: 🐙 Track development activities (commits, PRs, issues, reviews) automatically
- **Manual Time Entries**: ✏️ Add time entries for work done outside the browser (IDE, terminal, offline)
- **Tags System**: 🏷️ Categorize and organize entries with custom color-coded tags
- **Entry Editing**: Edit any time entry (automatic or manual) for accuracy
- **Meeting Tracking**: Correlate calendar meetings with actual time spent
- **GitHub Activity Correlation**: Match GitHub events with browser tracking sessions
- **Comprehensive Insights**: AI-powered insights across all data sources

## Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neram.git
   cd neram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in browser**

   #### Chrome/Edge
   1. Open `chrome://extensions/` (or `edge://extensions/`)
   2. Enable "Developer mode"
   3. Click "Load unpacked"
   4. Select the `dist` folder

   #### Firefox
   1. Open `about:debugging#/runtime/this-firefox`
   2. Click "Load Temporary Add-on"
   3. Select any file in the `dist` folder

### Pre-built Package

1. Download the latest release from the [Releases page](https://github.com/yourusername/neram/releases)
2. Extract the ZIP file
3. Follow the "Load in browser" instructions above

## Usage

### Quick Start

1. **Install the extension** following the instructions above
2. **Start browsing** - the extension automatically starts tracking
3. **Click the extension icon** to see current session stats
4. **Open the dashboard** for detailed analytics

### Popup Interface

Click the extension icon to access:
- Current session information
- Today's total time and productivity score
- Top 5 visited sites
- Pause/Resume tracking button
- Quick access to dashboard

### Dashboard

Open the dashboard to view:

#### Overview Tab
- Total time, productivity score, focus score
- Daily activity timeline chart
- Category breakdown pie chart
- Top domains table with search and sorting

#### Analytics Tab
- Hourly activity heatmap
- Weekly comparison chart
- Personalized insights and recommendations

#### Categories Tab
- Time breakdown by category
- Productivity scoring per category
- Visit counts and percentages

#### Settings Tab
- Configure employee profile for timesheet export
- Enable/disable tracking
- Configure idle timeout
- Set up Focus Mode
- Manage blacklist
- **BYOC Calendar Integration** 📅 - Input your own OAuth Client IDs (FREE)
- **GitHub Integration** 🐙 - Configure Personal Access Token (FREE)
- Enable auto-sync for meetings
- Data management options

#### Time Entries Tab ✏️ NEW!
- View all time entries (automatic browser tracking + manual entries)
- Add manual time entries for offline work (IDE, terminal, meetings, etc.)
- Edit any time entry (automatic or manual)
- Delete manual entries
- Filter by tags, date range, or category
- Color-coded tags for organization
- Manage tags (create, edit, delete, customize colors)
- **Setup Guide**: See [MANUAL_ENTRIES_GUIDE.md](MANUAL_ENTRIES_GUIDE.md) for best practices

#### Meetings Tab 📅
- View calendar meetings from Google Calendar and Microsoft Outlook
- See scheduled vs actual time spent in meetings
- Track meeting attendance confirmation
- Meeting utilization metrics (engagement level)
- Export meetings data to CSV
- Meeting insights and recommendations
- **Setup Guide**: See [CALENDAR_SETUP_GUIDE.md](CALENDAR_SETUP_GUIDE.md) for BYOC setup

#### GitHub Tab 🐙 NEW!
- View GitHub activities (commits, PRs, issues, code reviews)
- Estimated time per activity type
- Actual tracked browser time on GitHub
- Activity correlation (GitHub events + browser tracking)
- Filter by repository, activity type, or date
- Export GitHub activities to CSV
- GitHub productivity insights
- **Setup Guide**: See [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md) for token setup

### Keyboard Shortcuts

You can add custom keyboard shortcuts in browser settings:
- `Alt+Shift+T` - Toggle tracking pause
- `Alt+Shift+D` - Open dashboard

## Configuration

### Settings

Access settings from the dashboard:

```javascript
{
  idleTimeout: 60,              // Seconds before considering user idle
  trackingEnabled: true,        // Master tracking toggle
  focusMode: false,             // Enable focus mode alerts
  focusModeThreshold: 30,       // Minutes before alert
  blacklist: [],                // Domains to exclude
  customCategories: {}          // Custom category mappings
}
```

### Privacy Settings

Neram respects your privacy:
- Automatically excludes banking and healthcare sites
- Never tracks password input pages
- Sanitizes URLs to remove sensitive parameters
- All data stored locally on your device
- No external servers or analytics

## Development

### Project Structure

```
neram/
├── manifest.json              # Extension manifest (Manifest V3)
├── package.json              # NPM dependencies
├── webpack.config.js         # Build configuration
├── src/
│   ├── background/
│   │   ├── service-worker.js # Main background script
│   │   ├── storage.js        # IndexedDB operations
│   │   ├── analytics.js      # Data analysis
│   │   └── manual-entries.js # Manual time entries & tags storage 🆕
│   ├── content/
│   │   └── activity-tracker.js # Activity monitoring
│   ├── popup/
│   │   ├── popup.html        # Popup interface
│   │   ├── popup.css         # Popup styles
│   │   └── popup.js          # Popup logic
│   ├── dashboard/
│   │   ├── dashboard.html    # Dashboard interface
│   │   ├── dashboard.css     # Dashboard styles
│   │   └── dashboard.js      # Dashboard logic with charts
│   ├── integrations/
│   │   ├── calendar-sync.js  # Calendar integration (Google/Microsoft) - BYOC
│   │   └── github-sync.js    # GitHub integration (Personal Access Token) 🆕
│   ├── utils/
│   │   ├── time-formatter.js # Time formatting utilities
│   │   ├── domain-parser.js  # URL/domain parsing
│   │   └── category-classifier.js # Website categorization
│   └── assets/
│       └── icons/            # Extension icons
└── tests/                    # Jest tests
```

### Build Scripts

```bash
# Development build with watch mode
npm run watch

# Production build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Package for Chrome
npm run package:chrome

# Package for Firefox
npm run package:firefox

# Package for all browsers
npm run package:all
```

### Technologies Used

- **Manifest V3**: Latest Chrome extension standard
- **IndexedDB**: Local data storage
- **Chrome Storage API**: Settings synchronization
- **Chart.js**: Data visualization
- **Webpack**: Module bundling
- **Jest**: Testing framework
- **Babel**: ES6+ transpilation

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Implement feature**
   - Add code to appropriate module
   - Write tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm test
   npm run build
   # Test in browser
   ```

4. **Submit pull request**

## Data Storage

### IndexedDB Stores

- **sessions**: Individual tracking sessions (automatic browser tracking)
- **daily_stats**: Aggregated daily statistics
- **weekly_stats**: Weekly summaries
- **monthly_stats**: Monthly summaries
- **categories**: Custom category mappings
- **manual_entries**: 🆕 Manually added time entries (with tags support)
- **tags**: 🆕 Custom tags with colors and usage statistics

### Data Schema

```javascript
// Session
{
  id: 1,
  domain: "github.com",
  title: "Repository",
  url: "https://github.com/...",
  category: "Development",
  startTime: 1704067200000,
  endTime: 1704070800000,
  duration: 3600000,
  date: "2024-01-01"
}

// Daily Stats
{
  date: "2024-01-01",
  totalTime: 28800000,
  sessionCount: 24,
  domains: [...],
  categories: [...],
  productivityScore: 75
}
```

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test time-formatter.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Test Coverage

- Utility functions: 95%+
- Domain parsing: 90%+
- Time formatting: 95%+
- Category classification: 85%+

## Troubleshooting

### Extension not tracking

1. Check if tracking is enabled in settings
2. Verify you're not on a blacklisted site
3. Check browser console for errors
4. Try reloading the extension

### Data not showing

1. Open developer tools: `chrome://extensions` → Details → Inspect views
2. Check IndexedDB in Application tab
3. Verify background service worker is running

### High memory usage

1. Check number of stored sessions
2. Run data cleanup from settings
3. Reduce data retention period

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Code Style

- Use ES6+ features
- Follow ESLint rules
- Write meaningful comments
- Keep functions small and focused

## Privacy Policy

Neram is designed with privacy as a core principle:

- **No external servers**: All data stays on your device
- **No tracking**: We don't track you or your data
- **No analytics**: No usage analytics sent anywhere
- **Open source**: Code is fully auditable
- **Local storage only**: Uses IndexedDB and chrome.storage
- **Sensitive site exclusion**: Automatically excludes banking, healthcare sites

## License

MIT License - see [LICENSE](LICENSE) file for details

## Changelog

### Version 1.2.0 (2025-01-14) - Cost-Free Complete Solution

- 💰 **BYOC (Bring Your Own Credentials)**: 100% free calendar integration - no monthly costs!
- 🐙 **GitHub Integration**: Track development activities (commits, PRs, issues, reviews)
- ✏️ **Manual Time Entries**: Add entries for offline work (IDE, terminal, meetings, etc.)
- 🏷️ **Tags System**: Color-coded tags for categorizing and organizing entries
- ✍️ **Entry Editing**: Edit any time entry (automatic or manual) for accuracy
- 📊 **Activity Correlation**: Match GitHub events with browser tracking sessions
- 🔍 **Advanced Filtering**: Filter entries by tags, date range, or category
- 📤 **Comprehensive Export**: Export all data sources (browser + manual + GitHub + calendar)
- 🎨 **Tag Management**: Create, customize colors, track usage, and organize entries
- 📖 **Complete Documentation**: Setup guides for GitHub, BYOC calendars, and manual entries

**Key Achievement**: **$0/month cost** instead of $65-320/month for backend services!

### Version 1.1.0 (2025-01-14)

- 📅 **Calendar Integration**: Sync meetings from Google Calendar and Microsoft Outlook
- Meeting tracking with actual time spent vs scheduled time
- Meeting attendance confirmation and utilization metrics
- Meeting insights and analytics
- Export meetings data with timesheet
- OAuth 2.0 authentication for calendar providers

### Version 1.0.0 (2024-01-01)

- Initial release
- Automatic time tracking
- Productivity scoring
- Interactive dashboard
- Focus mode
- Data export
- Employee timesheet export
- Category classification
- Hourly/daily/weekly/monthly analytics
- Dummy data visualization

## Support

### Documentation Guides

- 📖 [README.md](README.md) - Main documentation (you are here)
- 📅 [CALENDAR_SETUP_GUIDE.md](CALENDAR_SETUP_GUIDE.md) - BYOC calendar integration setup
- 🐙 [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md) - GitHub integration with PAT
- ✏️ [MANUAL_ENTRIES_GUIDE.md](MANUAL_ENTRIES_GUIDE.md) - Manual time entries and tags
- 📊 [USAGE_GUIDE.md](USAGE_GUIDE.md) - General usage instructions
- 🔄 [DATA_SYNC_GUIDE.md](DATA_SYNC_GUIDE.md) - Data backup and synchronization

### Community & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/neram/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/neram/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/neram/discussions)

## Roadmap

### Version 1.1.0 ✅ COMPLETED
- [x] Calendar integration (Google Calendar & Microsoft Outlook)
- [x] Meeting tracking and analytics
- [x] Meeting attendance and utilization metrics
- [x] Employee timesheet export

### Version 1.2.0 ✅ COMPLETED - Cost-Free Solution
- [x] BYOC (Bring Your Own Credentials) for calendars - $0/month!
- [x] GitHub integration with Personal Access Token
- [x] Manual time entries with full CRUD operations
- [x] Tags system with color customization
- [x] Activity correlation (GitHub + browser tracking)
- [x] Advanced filtering by tags, date, category
- [x] Comprehensive documentation (3 new guides)

### Version 1.3.0 - Enhanced Features
- [ ] Custom time estimates for GitHub activity types
- [ ] Bulk edit time entries
- [ ] Tag templates and presets
- [ ] Goals and targets per project/client
- [ ] Notifications for milestones and daily summaries
- [ ] More chart types (Gantt, burndown)
- [ ] PDF export for reports
- [ ] Auto-sync meetings every hour

### Version 1.4.0 - Team & Collaboration
- [ ] Multi-device sync (cloud backup option)
- [ ] Teams/shared analytics
- [ ] Project-based tracking with milestones
- [ ] Custom themes and dashboard layouts
- [ ] API for integrations
- [ ] Slack/Discord notifications

### Version 2.0.0 - AI & Advanced Analytics
- [ ] Machine learning for better categorization
- [ ] Predictive analytics (estimate project completion)
- [ ] Time tracking across applications (desktop app)
- [ ] Mobile companion app
- [ ] Voice commands for manual entries
- [ ] Smart suggestions for time optimization

## Credits

Built with:
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [date-fns](https://date-fns.org/) - Date utilities
- Chrome Extension APIs

## Authors

- Your Name - Initial work

## Acknowledgments

- Thanks to all contributors
- Inspired by RescueTime, Toggl, and similar tools
- Icons from [source]

---

**Made with ⏱️ by developers, for developers**
