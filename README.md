# TimeTracker Pro

A comprehensive browser extension for tracking time spent on websites with detailed analytics and productivity insights.

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
- **Data Export**: Export your data as JSON/CSV
- **Custom Categories**: Assign custom categories to domains
- **Data Retention**: Automatically cleans up data older than 90 days
- **Settings Sync**: Settings synchronized across devices (via chrome.storage.sync)

## Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timetracker-pro.git
   cd timetracker-pro
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

1. Download the latest release from the [Releases page](https://github.com/yourusername/timetracker-pro/releases)
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
- Enable/disable tracking
- Configure idle timeout
- Set up Focus Mode
- Manage blacklist
- Data management options

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

TimeTracker Pro respects your privacy:
- Automatically excludes banking and healthcare sites
- Never tracks password input pages
- Sanitizes URLs to remove sensitive parameters
- All data stored locally on your device
- No external servers or analytics

## Development

### Project Structure

```
timetracker-pro/
├── manifest.json              # Extension manifest (Manifest V3)
├── package.json              # NPM dependencies
├── webpack.config.js         # Build configuration
├── src/
│   ├── background/
│   │   ├── service-worker.js # Main background script
│   │   ├── storage.js        # IndexedDB operations
│   │   └── analytics.js      # Data analysis
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

- **sessions**: Individual tracking sessions
- **daily_stats**: Aggregated daily statistics
- **weekly_stats**: Weekly summaries
- **monthly_stats**: Monthly summaries
- **categories**: Custom category mappings

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

TimeTracker Pro is designed with privacy as a core principle:

- **No external servers**: All data stays on your device
- **No tracking**: We don't track you or your data
- **No analytics**: No usage analytics sent anywhere
- **Open source**: Code is fully auditable
- **Local storage only**: Uses IndexedDB and chrome.storage
- **Sensitive site exclusion**: Automatically excludes banking, healthcare sites

## License

MIT License - see [LICENSE](LICENSE) file for details

## Changelog

### Version 1.0.0 (2024-01-01)

- Initial release
- Automatic time tracking
- Productivity scoring
- Interactive dashboard
- Focus mode
- Data export
- Category classification
- Hourly/daily/weekly/monthly analytics

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/timetracker-pro/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/timetracker-pro/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/timetracker-pro/discussions)

## Roadmap

### Version 1.1.0
- [ ] Goals and targets
- [ ] Notifications for milestones
- [ ] More chart types
- [ ] PDF export
- [ ] Calendar integration

### Version 1.2.0
- [ ] Multi-device sync
- [ ] Teams/shared analytics
- [ ] Advanced filtering
- [ ] Custom themes
- [ ] API for integrations

### Version 2.0.0
- [ ] Machine learning for better categorization
- [ ] Predictive analytics
- [ ] Project-based tracking
- [ ] Time tracking across applications
- [ ] Mobile companion app

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
