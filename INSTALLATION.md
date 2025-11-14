# TimeTracker Pro - Installation Guide

## Quick Start

The extension has been successfully built and is ready to install!

## Installation Steps

### For Chrome/Edge/Brave

1. **Open Extensions Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
   - Brave: Navigate to `brave://extensions/`

2. **Enable Developer Mode**
   - Look for the "Developer mode" toggle in the top right corner
   - Turn it ON

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to your project directory
   - Select the `dist` folder
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "TimeTracker Pro" appear in your extensions list
   - The extension icon should appear in your browser toolbar
   - If you don't see the icon, click the puzzle piece icon and pin TimeTracker Pro

### For Firefox

1. **Open Debug Page**
   - Navigate to `about:debugging#/runtime/this-firefox`

2. **Load Temporary Add-on**
   - Click "Load Temporary Add-on..."
   - Navigate to your project directory
   - Go to the `dist` folder
   - Select the `manifest.json` file
   - Click "Open"

3. **Verify Installation**
   - The extension should appear in your add-ons list
   - The extension icon should appear in your toolbar

**Note for Firefox**: Temporary add-ons are removed when Firefox is closed. For persistent installation, you'll need to package and sign the extension through Mozilla's process.

## First Time Setup

Once installed:

1. **Click the extension icon** in your toolbar
2. You'll see the popup with current session information
3. **Start browsing** - the extension automatically begins tracking
4. **Open the dashboard** by clicking "Open Dashboard" in the popup

## Testing the Extension

### 1. Test Automatic Tracking

1. Visit a few websites (e.g., github.com, stackoverflow.com, youtube.com)
2. Stay on each site for at least 30 seconds
3. Click the extension icon to see current session
4. Open the dashboard to see accumulated stats

### 2. Test Pause/Resume

1. Click the extension icon
2. Click the pause button (⏸️)
3. Browse to a new site - it should NOT be tracked
4. Click the resume button (▶️) to restart tracking

### 3. Test Dashboard Features

1. Click "Open Dashboard" from the popup
2. Navigate through different tabs:
   - **Overview**: See today's stats, charts, and top domains
   - **Analytics**: View hourly heatmap and weekly comparison
   - **Categories**: See time breakdown by category
   - **Settings**: Configure tracking preferences

### 4. Test Settings

1. Go to Settings in the dashboard
2. Try adding a domain to the blacklist
3. Toggle Focus Mode on/off
4. Adjust idle timeout
5. Click "Save Settings"

## Troubleshooting

### Extension Not Appearing

- Make sure Developer Mode is enabled
- Try reloading the extension page
- Check browser console for errors (F12)

### Not Tracking Time

1. Check if tracking is enabled (not paused)
2. Verify the site is not blacklisted
3. Make sure it's not a browser internal page (chrome://, about:, etc.)
4. Check the browser console for errors

### Dashboard Not Opening

1. Right-click the extension icon
2. Check if there are any errors
3. Try reloading the extension
4. Check if popup.html exists in dist folder

### Data Not Showing

1. Open DevTools (F12) on the dashboard
2. Check the Console tab for errors
3. Go to Application → IndexedDB → TimeTrackerDB
4. Verify sessions are being stored

### Build Errors

If you need to rebuild:

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

## Development Mode

For development with auto-reload:

```bash
# Start watch mode
npm run watch

# In another terminal, use a tool like web-ext for auto-reload
npm install -g web-ext
web-ext run --source-dir=dist
```

## Creating Icons

The extension currently uses placeholder icons. To add real icons:

1. **Create icons in three sizes**: 16x16, 48x48, 128x128 pixels
2. **Save as PNG files** in `src/assets/icons/`:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
3. **Rebuild the extension**: `npm run build`
4. **Reload the extension** in your browser

### Icon Design Tips

- Use a simple, recognizable symbol (clock, stopwatch, timer)
- Ensure good contrast for visibility
- Make sure it looks good at all sizes
- Use transparent background
- Follow platform design guidelines

## Packaging for Distribution

### Chrome Web Store

```bash
# Build and package
npm run build
npm run package:chrome

# This creates timetracker-chrome.zip
# Upload to Chrome Web Store Developer Dashboard
```

### Firefox Add-ons

```bash
# Build and package
npm run build
npm run package:firefox

# This creates timetracker-firefox.zip
# Submit to Firefox Add-ons (requires signing)
```

## Updating the Extension

After making changes:

1. **Rebuild**: `npm run build`
2. **Reload extension**:
   - Chrome/Edge: Go to extensions page, click reload icon
   - Firefox: Go to debugging page, click reload

## Uninstalling

### Chrome/Edge/Brave
1. Go to extensions page
2. Find TimeTracker Pro
3. Click "Remove"

### Firefox
1. Go to `about:addons`
2. Find TimeTracker Pro
3. Click "Remove"

## Data Backup

Before uninstalling, you can export your data:

1. Open the dashboard
2. Click the "Export Data" button in the sidebar
3. Save the JSON file
4. To import later, you can write a custom import script

## Privacy & Security

- All data is stored locally on your device
- No data is sent to external servers
- Extension only has access to tab information
- Banking and healthcare sites are automatically excluded
- You can add custom blacklist domains

## Getting Help

If you encounter issues:

1. Check this installation guide
2. Review the main README.md
3. Check browser console for errors
4. Submit an issue on GitHub with:
   - Browser name and version
   - Extension version
   - Steps to reproduce
   - Console error messages

## Next Steps

Now that the extension is installed:

1. **Use it daily** to build up your activity data
2. **Check the dashboard regularly** to see your patterns
3. **Adjust settings** to match your workflow
4. **Set productivity goals** using Focus Mode
5. **Export your data** periodically for backup

## System Requirements

- **Chrome**: Version 88+
- **Edge**: Version 88+
- **Firefox**: Version 78+
- **Storage**: ~10MB for typical usage
- **Permissions Required**:
  - `tabs`: To track active tabs
  - `storage`: To save data locally
  - `idle`: To detect inactivity
  - `alarms`: For periodic tasks

## Performance

- **Memory Usage**: ~10-20MB typical
- **CPU Usage**: Minimal (< 1%)
- **Storage Growth**: ~1-2MB per month of data
- **Auto-cleanup**: Removes data older than 90 days

---

**Enjoy tracking your time and improving productivity! ⏱️**
