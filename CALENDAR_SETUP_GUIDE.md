# Calendar Integration Setup Guide

## 📅 Overview

TimeTracker Pro now supports calendar integration with **Google Calendar** and **Microsoft Outlook**, allowing you to:
- Sync meeting details (name, date, time, duration)
- Track actual time spent in meetings vs scheduled time
- Correlate browser activity with calendar events
- Export comprehensive meeting reports
- Get insights on meeting attendance and engagement

---

## 🔑 Setting Up OAuth Credentials

To use calendar integration, you need to set up OAuth credentials for Google and/or Microsoft.

---

## 📧 Google Calendar Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Name: `TimeTracker Pro`
   - Click "Create"

### Step 2: Enable Google Calendar API

1. **Navigate to APIs & Services** → **Library**
2. **Search for "Google Calendar API"**
3. **Click "Enable"**

### Step 3: Create OAuth Credentials

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **OAuth client ID**
3. **Configure OAuth consent screen** (if first time):
   - User Type: **External**
   - App name: `TimeTracker Pro`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `https://www.googleapis.com/auth/calendar.readonly`
   - Test users: Add your email (for testing)
4. **Create OAuth client ID**:
   - Application type: **Chrome extension**
   - Name: `TimeTracker Pro Extension`
   - Copy the **Extension ID** from Chrome (chrome://extensions/)
   - Paste as **Application ID**
5. **Copy the Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)

### Step 4: Update manifest.json

1. **Open** `manifest.json` in your extension folder
2. **Replace** `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
   ```json
   "oauth2": {
     "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/calendar.readonly"
     ]
   }
   ```

### Step 5: Test the Connection

1. **Reload the extension** in Chrome
2. **Open dashboard** → **Settings** → **Calendar Integration**
3. **Click "Connect Google"**
4. **Sign in** with your Google account
5. **Grant permissions** when prompted
6. **Success!** Google Calendar is now connected

---

## 📨 Microsoft Outlook Setup

### Step 1: Register Application in Azure

1. **Go to Azure Portal**: https://portal.azure.com/
2. **Navigate to** "Azure Active Directory" → "App registrations"
3. **Click "New registration"**:
   - Name: `TimeTracker Pro`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: Leave blank for now
   - Click "Register"

### Step 2: Configure Authentication

1. **Go to "Authentication"** in your app
2. **Add a platform** → **Single-page application**
3. **Redirect URIs**: Add your extension's redirect URL:
   - Format: `https://<extension-id>.chromiumapp.org/microsoft`
   - Get Extension ID from `chrome://extensions/`
   - Example: `https://abcdefghijklmnop.chromiumapp.org/microsoft`
4. **Check "Access tokens"** and **"ID tokens"** under Implicit grant
5. **Click "Save"**

### Step 3: Add API Permissions

1. **Go to "API permissions"**
2. **Click "Add a permission"**
3. **Select "Microsoft Graph"**
4. **Select "Delegated permissions"**
5. **Add**: `Calendars.Read`
6. **Click "Add permissions"**
7. **Grant admin consent** (if required)

### Step 4: Get Client ID

1. **Go to "Overview"**
2. **Copy the "Application (client) ID"** (looks like: `12345678-1234-1234-1234-123456789abc`)

### Step 5: Update calendar-sync.js

1. **Open** `src/integrations/calendar-sync.js`
2. **Find line** with `YOUR_MICROSOFT_CLIENT_ID`
3. **Replace** with your actual Client ID:
   ```javascript
   const clientId = 'YOUR_ACTUAL_CLIENT_ID'; // Replace this
   ```

### Step 6: Test the Connection

1. **Rebuild the extension**: `npm run build`
2. **Reload the extension** in Chrome
3. **Open dashboard** → **Settings** → **Calendar Integration**
4. **Click "Connect Outlook"**
5. **Sign in** with your Microsoft account
6. **Grant permissions** when prompted
7. **Success!** Microsoft Outlook is now connected

---

## 🎯 Using Calendar Integration

### Connecting Calendars

#### Via Settings:
1. **Open Dashboard** → **Settings**
2. **Scroll to "Calendar Integration"**
3. **Click "Connect Google"** or **"Connect Outlook"**
4. **Authenticate** when prompted

### Viewing Meetings

1. **Go to "Meetings" tab** in the dashboard
2. **See connection status** at the top
3. **Meeting table shows**:
   - Meeting title
   - Date & time
   - Scheduled duration
   - Actual time spent (from browser tracking)
   - Attendance confirmation
   - Utilization percentage
   - Calendar provider
   - Number of attendees

### Understanding Meeting Data

#### Scheduled Duration
Time allocated for the meeting in your calendar.

#### Actual Time Spent
Time your browser tracked during the meeting period (based on active tabs and focus).

#### Attendance Status
- **✓ Confirmed**: Meeting URL was visited OR browser activity detected during meeting time
- **? Unconfirmed**: No browser activity detected (meeting may have been offline or in another app)

#### Utilization Rate
Percentage of meeting time where browser activity was tracked:
- **80%+** (Green): High engagement
- **50-79%** (Yellow): Medium engagement
- **<50%** (Red): Low engagement or multitasking

### Meeting Insights

The dashboard automatically generates insights:
- **Total meeting time** (scheduled vs actual)
- **Attendance rate** (how many meetings you attended)
- **Average utilization** (engagement level)
- **Long meeting alerts** (meetings over 2 hours)

### Exporting Meeting Data

1. **Go to Meetings tab**
2. **Click "Export Meetings"**
3. **CSV file downloads** with:
   - Meeting details
   - Time tracking data
   - Attendance and utilization metrics
   - Provider information

---

## ⚙️ Advanced Settings

### Auto-sync Meetings

**Enable in Settings**:
- Go to **Settings** → **Calendar Integration**
- Toggle **"Auto-sync Meetings"** ON
- Meetings will refresh automatically every hour

**Note**: Currently, auto-sync feature is prepared but not yet fully implemented. Manual refresh works via the "🔄 Refresh" button in the Meetings tab.

### Date Range

Use the date range selector in the header to filter meetings:
- **Today**: Today's meetings only
- **This Week**: Past 7 days
- **This Month**: Past 30 days
- **Custom Range**: (To be implemented)

---

## 🔒 Privacy & Security

### Data Storage
- **Calendar tokens**: Stored encrypted in Chrome's local storage
- **Meeting data**: Cached locally, never sent to external servers
- **Permissions**: Read-only access to calendars

### What We Access
- ✅ Meeting titles
- ✅ Meeting times
- ✅ Attendee count
- ✅ Meeting URLs (for attendance confirmation)

### What We DON'T Access
- ❌ Meeting content/notes
- ❌ Email addresses of attendees (except organizer for context)
- ❌ Calendar modifications (read-only)

### Disconnecting

**To disconnect a calendar**:
1. Go to **Settings** → **Calendar Integration**
2. Click **"Disconnect"** next to the provider
3. Tokens are immediately revoked
4. Meeting data is cleared

---

## 🐛 Troubleshooting

### "Failed to connect Google Calendar"

**Possible causes**:
1. **Incorrect Client ID**: Verify in manifest.json
2. **Extension ID mismatch**: Ensure OAuth consent screen has correct extension ID
3. **API not enabled**: Check Google Calendar API is enabled in Cloud Console
4. **Scope not approved**: Make sure calendar.readonly scope is added

**Fix**:
- Double-check OAuth credentials
- Reload extension after changing manifest.json
- Clear browser cache and try again

### "Failed to connect Microsoft Outlook"

**Possible causes**:
1. **Incorrect Client ID**: Verify in calendar-sync.js
2. **Wrong redirect URI**: Must match extension ID exactly
3. **Missing permissions**: Calendars.Read permission not granted
4. **Consent not granted**: Admin consent required in some organizations

**Fix**:
- Verify Azure app registration settings
- Check redirect URI format
- Request admin consent if in organization
- Rebuild extension after changing calendar-sync.js

### "No meetings showing"

**Check**:
1. **Calendar connected?** Status cards should show "Connected"
2. **Date range correct?** Try "This Week" or "This Month"
3. **Meetings in calendar?** Verify in Google/Outlook web calendar
4. **Refresh data**: Click "🔄 Refresh" button

### "Attendance not confirmed"

**Reasons**:
- Meeting was in another app (Zoom desktop, Teams app)
- Browser was closed during meeting
- Meeting URL not recognized (custom meeting platforms)

**This is normal** for offline meetings or when using desktop apps instead of web browsers.

### "Low utilization rate"

**Possible reasons**:
- Multitasking during meeting
- Meeting ran shorter than scheduled
- Browser minimized/inactive
- Desktop sharing (not tracked by browser)

**Not necessarily bad** - some meetings allow parallel work.

---

## 📊 Best Practices

### For Accurate Tracking

1. **Use web-based meeting tools** (Google Meet, Teams web, Zoom web)
2. **Keep browser open** during meetings
3. **Avoid minimizing** browser during calls
4. **Sync regularly** to get latest meeting data

### For Privacy

1. **Connect personal calendars only** on personal devices
2. **Disconnect before sharing** computer with others
3. **Export regularly** before clearing data
4. **Review permissions** in Google/Microsoft account settings

### For Insights

1. **Review weekly** to see meeting patterns
2. **Track utilization trends** over time
3. **Identify meeting overload** (total hours)
4. **Optimize schedule** based on engagement data

---

## 🚀 Future Enhancements

Planned features:
- 🔔 **Auto-sync every hour** (enable in settings)
- 📅 **Custom date range picker**
- 📊 **Meeting analytics charts** (trends over time)
- 🎯 **Meeting categories** (1-on-1, team, client, etc.)
- ⚡ **Quick meeting notes** (add context to meetings)
- 📱 **Mobile app sync** (future cross-platform support)

---

## 📞 Need Help?

### Resources
- Main [README.md](README.md) - Extension overview
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - General usage
- [DATA_SYNC_GUIDE.md](DATA_SYNC_GUIDE.md) - Data backup
- [INSTALLATION.md](INSTALLATION.md) - Installation steps

### Support
- Check browser console (F12) for errors
- Review OAuth setup steps above
- Submit issues on GitHub with error details

---

## ✅ Quick Reference

### Google Calendar Setup
1. Create Google Cloud project
2. Enable Calendar API
3. Create OAuth client ID (Chrome extension type)
4. Copy Client ID to manifest.json
5. Reload extension

### Microsoft Outlook Setup
1. Register app in Azure Portal
2. Add redirect URI for extension
3. Add Calendars.Read permission
4. Copy Client ID to calendar-sync.js
5. Rebuild and reload extension

### Using Calendar Integration
1. Connect calendar in Settings
2. View meetings in Meetings tab
3. Export data with Export Meetings button
4. Get insights from Meeting Insights section

---

**Happy meeting tracking! 📅⏱️**
