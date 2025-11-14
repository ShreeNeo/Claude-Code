# Data Backup & Sync Guide

## 📊 Overview

TimeTracker Pro stores all your tracking data locally on your device using IndexedDB. This guide explains your options for backing up and syncing your data across devices.

---

## 🔐 Current Data Storage

### Local Storage (IndexedDB)
- **Location**: Stored in your browser's IndexedDB
- **Capacity**: Several GB of storage available
- **Persistence**: Data persists until you clear browser data or uninstall the extension
- **Auto-cleanup**: Sessions older than 90 days are automatically deleted

### What's Stored:
- ✅ **Sessions**: Every tracking session with domain, time, category
- ✅ **Daily Stats**: Aggregated daily statistics
- ✅ **Weekly/Monthly Stats**: Historical summaries
- ✅ **Custom Categories**: Your category mappings
- ✅ **Settings**: Tracking preferences, blacklist, focus mode settings
- ✅ **Employee Profile**: Your employee details for export

---

## ☁️ Built-in Sync: Chrome Sync Storage

### What is Chrome Sync?

Chrome automatically syncs certain extension data across all devices where you're signed in with the same Google account.

### What Gets Synced Automatically:

✅ **Employee Profile** (your employee code, name, company, etc.)
✅ **Settings** (tracking preferences, idle timeout, focus mode)
✅ **Blacklist** (excluded domains)
✅ **Custom Categories** (your category mappings)

### What Doesn't Sync:

❌ **Tracking Sessions** (stored in IndexedDB, stays local)
❌ **Daily/Weekly/Monthly Stats** (generated from local sessions)
❌ **Large datasets** (Chrome Sync has 100KB limit per extension)

### How to Use Chrome Sync:

1. **Sign in to Chrome** on all your devices
2. **Enable Sync**:
   - Go to `chrome://settings/syncSetup`
   - Turn on "Extensions" sync
3. **Install extension** on each device
4. **Configure employee profile** once - it syncs everywhere!

---

## 💾 Manual Data Backup Options

### Option 1: Export Data Regularly

The **safest and easiest** method:

#### Steps:
1. **Open Dashboard** → Click **"Export Data"** button
2. **Save CSV file** to your computer
3. **Schedule regular exports** (weekly or monthly)
4. **Store backups** in Google Drive, Dropbox, or cloud storage

#### What You Get:
- CSV file with all your timesheet entries
- Employee details included in every row
- Ready to import into Excel, Google Sheets, or any timesheet system
- Format: `timesheet_<empcode>_<date>.csv`

#### Advantages:
- ✅ Human-readable format
- ✅ Can be opened in any spreadsheet app
- ✅ Easy to share with managers or HR
- ✅ No dependency on the extension
- ✅ Works with any backup system (cloud, external drive)

#### Recommended Schedule:
- **Weekly**: For active users
- **Monthly**: For occasional users
- **Before clearing data**: Always export first!

---

### Option 2: Browser Profile Backup

Backup your entire Chrome profile (includes all extension data):

#### Windows:
```
C:\Users\<username>\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\
```

#### macOS:
```
~/Library/Application Support/Google/Chrome/Default/IndexedDB/
```

#### Linux:
```
~/.config/google-chrome/Default/IndexedDB/
```

#### Steps:
1. **Close Chrome** completely
2. **Copy the IndexedDB folder** to your backup location
3. **To restore**: Copy folder back and restart Chrome

#### Advantages:
- ✅ Complete backup including all extension data
- ✅ Can restore exact state

#### Disadvantages:
- ❌ Complex folder structure
- ❌ Not human-readable
- ❌ Requires technical knowledge
- ❌ Chrome must be closed

---

## 🌐 Cloud Sync Options (Future)

### Why Not Built-in Cloud Sync?

A full cloud sync feature would require:

1. **Backend Server**: To store user data
2. **Database**: PostgreSQL, MongoDB, etc.
3. **Authentication System**: User accounts with email/password
4. **API**: For syncing data between devices
5. **Hosting Costs**: Server and database hosting
6. **Security**: Encryption, data protection, GDPR compliance
7. **Maintenance**: Ongoing server management

**This is beyond the scope of a free browser extension.**

### Alternative Solutions:

#### 1. Self-Hosted Sync (Advanced Users)

If you have technical skills, you can:
- Set up your own sync server
- Use Firebase, Supabase, or similar services
- Modify the extension to connect to your server
- Full control over your data

#### 2. Cloud Storage + Exports

The **recommended approach** for most users:

1. **Schedule automatic exports**:
   - Set a calendar reminder (weekly/monthly)
   - Export data to CSV

2. **Auto-upload to cloud**:
   - Use Google Drive, Dropbox, or OneDrive
   - Enable auto-sync on your computer
   - CSV files automatically backed up

3. **Access from any device**:
   - Download CSV from cloud storage
   - Import into spreadsheet on any device
   - View historical data anywhere

#### 3. Browser Sync Services

Use Chrome Sync + Regular Exports:
- Settings sync automatically via Chrome
- Sessions export manually to cloud storage
- Best of both worlds

---

## 📤 Data Export & Import

### Export Process

#### From Dashboard:
1. **Open Dashboard** → **Analytics** tab
2. View full timesheet table with all sessions
3. Click **"Export Timesheet"** button
4. CSV file downloads automatically

#### From Sidebar:
1. Click **"💾 Export Data"** in sidebar
2. Works from any tab
3. Same CSV format

### CSV Format:

```
Emp Code	Emp Name	Company Code	Practice	Product Name	Project/Client	Task/Description	Working Hours (8H)	Logged Date
neo10013	SHREEHARAN	N080	Product Management	NeoPAT 2.0	NeoPAT 2.0	Development work on github.com	1.50	14-Nov-25
neo10013	SHREEHARAN	N080	Product Management	NeoPAT 2.0	NeoPAT 2.0	Work & Productivity work on gmail.com	0.50	14-Nov-25
```

### Import (Manual)

Currently, there's no automatic import feature, but you can:
1. Keep CSV files as historical records
2. Merge multiple exports in spreadsheet software
3. Submit to HR/timesheet systems directly

---

## 🔒 Data Security & Privacy

### Local Storage Security:
- ✅ **Encrypted**: Chrome encrypts IndexedDB on disk
- ✅ **Isolated**: Each extension has its own database
- ✅ **No external access**: Data never leaves your device
- ✅ **User control**: Delete anytime via settings

### Chrome Sync Security:
- ✅ **End-to-end encryption**: Google encrypts synced data
- ✅ **Google account protected**: Your data is as secure as your Google account
- ✅ **Selective sync**: Choose what to sync

### Best Practices:
- 🔐 **Use strong Google password**
- 🔐 **Enable 2-factor authentication** on Google account
- 🔐 **Export sensitive data** to encrypted cloud storage
- 🔐 **Don't share employee code** publicly
- 🔐 **Clear data** before selling/gifting computer

---

## 🆘 Data Recovery

### If You Lose Data:

#### 1. Check Exports
- Look for CSV exports in your Downloads folder
- Check cloud storage (Google Drive, Dropbox)
- Restore from most recent export

#### 2. Chrome Sync
- Settings and employee profile may sync back
- Tracking sessions won't sync (stored locally only)

#### 3. Browser Backup
- If you backed up Chrome profile, restore from backup
- Follow "Browser Profile Backup" instructions above

### Prevention:

✅ **Export weekly** - Set a calendar reminder
✅ **Use cloud storage** - Auto-backup exports
✅ **Enable Chrome Sync** - At least settings are saved
✅ **Multiple devices** - Install on home and work computer

---

## 📋 Recommended Workflow

### For Maximum Data Safety:

#### Daily:
- ✅ Extension tracks automatically
- ✅ Chrome Sync handles settings

#### Weekly:
- ✅ Export timesheet to CSV
- ✅ Upload to Google Drive/Dropbox
- ✅ Review insights in Analytics tab

#### Monthly:
- ✅ Submit timesheet to HR/manager
- ✅ Verify exports are backed up
- ✅ Clean up old exports if needed

#### Before Major Changes:
- ✅ Export data before clearing
- ✅ Export before uninstalling
- ✅ Export before computer wipe/reset

---

## 🚀 Future Cloud Sync (Roadmap)

We're considering adding cloud sync in a future version:

### Potential Features:
- 📧 **Email-based accounts** (signup with email)
- ☁️ **Automatic cloud sync** across devices
- 📱 **Web dashboard** (access from any browser)
- 👥 **Team features** (for organizations)
- 📊 **Advanced analytics** (server-side processing)
- 🔔 **Email reports** (weekly summaries)

### Requirements:
- Funding for server costs
- User demand for cloud features
- Privacy-preserving implementation
- Optional (local-only still available)

### Interested?
Let us know! Your feedback helps us prioritize features.

---

## 📞 Need Help?

### Backup Issues:
- Check browser console (F12) for errors
- Ensure Chrome Sync is enabled
- Verify IndexedDB permissions

### Export Issues:
- Complete employee profile in Settings
- Check if you have tracking data
- Enable dummy data to test export format

### Sync Issues:
- Sign in to Chrome on all devices
- Enable Extensions sync in Chrome settings
- Wait a few minutes for sync to complete

---

## ✅ Summary

### What's Automatically Backed Up:
- ✅ Settings (via Chrome Sync)
- ✅ Employee Profile (via Chrome Sync)

### What You Should Manually Backup:
- 💾 Tracking sessions (via CSV export)
- 💾 Historical data (via CSV export)

### Recommended Approach:
1. Enable Chrome Sync for settings
2. Export CSV weekly/monthly
3. Store exports in cloud storage
4. Keep recent exports as backup

### Best for You:
- **Casual users**: Export monthly
- **Active users**: Export weekly
- **Enterprise users**: Export weekly + submit to HR
- **Technical users**: Browser profile backup + exports

---

**Your data is safe with local storage + regular exports! 💪**
