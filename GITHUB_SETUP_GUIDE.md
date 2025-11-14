# GitHub Integration Setup Guide

## 🐙 Overview

TimeTracker Pro now includes **GitHub Integration** to automatically track your development activities, allowing you to:
- Sync GitHub events (commits, PRs, issues, reviews)
- Track time spent on GitHub activities
- Correlate GitHub work with browser tracking
- Estimate time for different activity types
- Export comprehensive development reports
- Get insights on coding patterns and productivity

---

## 💰 Cost-Free Solution

GitHub Integration uses a **Personal Access Token (PAT)** approach:
- ✅ **100% FREE** - No API costs or subscriptions
- ✅ **Simple setup** - Just create a token in GitHub settings
- ✅ **Secure** - Token stored locally in your browser
- ✅ **Complete privacy** - Your data stays on your device
- ✅ **No OAuth complexity** - Direct API access

**No backend servers = $0/month cost!**

---

## 🔑 Creating a GitHub Personal Access Token

### Step 1: Go to GitHub Settings

1. **Login to GitHub**: https://github.com
2. **Click your profile picture** (top right) → **Settings**
3. **Scroll down** and click **Developer settings** (left sidebar)
4. **Click "Personal access tokens"** → **"Tokens (classic)"**

### Step 2: Generate New Token

1. **Click "Generate new token"** → **"Generate new token (classic)"**
2. **Note**: Give your token a descriptive name
   - Example: `TimeTracker Pro Extension`
3. **Expiration**: Choose expiration period
   - Recommended: **90 days** (you can regenerate later)
   - Or: **No expiration** (less secure but convenient)

### Step 3: Select Scopes

For TimeTracker Pro to work, you need these scopes:

**Required Scopes**:
- ✅ **`read:user`** - Read user profile data
- ✅ **`repo`** - Access repository data (for private repos)
  - Or just **`public_repo`** if you only work on public repos

**Optional Scopes** (for additional features):
- `read:org` - Read organization data
- `read:project` - Read project boards

**Note**: Only select the minimum scopes needed. TimeTracker Pro only reads data, never writes.

### Step 4: Generate and Copy Token

1. **Scroll down** and click **"Generate token"**
2. **Copy the token immediately** - it looks like:
   - `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (classic tokens)
   - `github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (fine-grained tokens)
3. **IMPORTANT**: Save this token securely - you won't be able to see it again!

---

## ⚙️ Configure GitHub in Extension

### Step 1: Open Dashboard

1. **Click the extension icon** in Chrome toolbar
2. **Click "Open Dashboard"**
3. **Go to Settings tab**

### Step 2: Find GitHub Integration Section

1. **Scroll to "GitHub Integration"** section
2. You'll see two input fields:
   - **GitHub Username**: Your GitHub username (e.g., `octocat`)
   - **Personal Access Token**: Your token from Step 4 above

### Step 3: Enter Credentials

1. **Enter your GitHub username** (not email, just username)
2. **Paste your Personal Access Token**
3. **Click "Save GitHub Credentials"**
4. **Wait for confirmation** message: "GitHub credentials saved successfully!"

**Security Note**: Your token is encrypted and stored locally in your browser. It's never sent to any external servers.

---

## 🎯 Using GitHub Integration

### Viewing GitHub Activities

1. **Go to "GitHub" tab** (🐙 icon) in the dashboard
2. **Check connection status** at the top
   - Should show: "✅ Connected as [your-username]"
3. **Click "Load GitHub Activities"** to fetch recent events

### GitHub Activity Table

The table displays all your GitHub activities:

| Column | Description |
|--------|-------------|
| **Type** | Activity type (Commit, Pull Request, Issue, Review, etc.) |
| **Repository** | Which repo the activity occurred in |
| **Description** | Human-readable description of what you did |
| **Details** | Specific details (PR number, commit count, etc.) |
| **Timestamp** | When the activity occurred |
| **Estimated Time** | Estimated time spent (based on activity type) |
| **Tracked Time** | Actual browser time on GitHub |
| **Link** | Direct link to the activity on GitHub |

### Activity Types Tracked

TimeTracker Pro tracks these GitHub events:

| Event Type | Estimated Duration | Description |
|------------|-------------------|-------------|
| **Commit** (PushEvent) | 30 minutes | Code commits to repositories |
| **Pull Request** | 1 hour | Creating or updating PRs |
| **Code Review** | 45 minutes | Reviewing pull requests |
| **Issue** | 15 minutes | Creating or updating issues |
| **Review Comment** | 10 minutes | Commenting on PR reviews |
| **Issue Comment** | 5 minutes | Commenting on issues |
| **Branch Create** | 10 minutes | Creating branches/tags |
| **Branch Delete** | 2 minutes | Deleting branches/tags |

**Note**: These are estimates. Actual time may vary based on complexity.

### Time Correlation

TimeTracker Pro intelligently correlates GitHub activities with your browser tracking:

- **2-hour time window**: Matches GitHub events with browser sessions within ±2 hours
- **GitHub domain tracking**: Identifies time spent on github.com
- **Utilization calculation**: Compares estimated vs actual tracked time
- **Related sessions**: Shows browser sessions during GitHub activities

**Example**:
- You pushed 3 commits at 2:00 PM (estimated: 30 min)
- Browser tracked 45 min on github.com between 1:30-2:45 PM
- Correlation: ✅ Tracked time exceeds estimate (good coverage)

### Filtering Activities

1. **Filter by type**: Use dropdown to show only specific activity types
2. **Filter by repository**: Search for specific repos
3. **Date range**: Use dashboard date selector to filter by time period

### GitHub Insights

The **GitHub Insights** section provides:

- **Total Activities**: Count of all GitHub events in selected period
- **Most Common Activity**: Your most frequent activity type
- **Time Tracking Coverage**: How much GitHub work was tracked in browser
- **Most Active Repository**: Which repo you worked on most
- **Productivity Patterns**: Insights on your development workflow

**Example Insights**:
- "You had 47 GitHub activities in this period."
- "Most common: Commit (23), Pull Request (12), Code Review (8)"
- "Browser tracked 12h 30m on GitHub. Estimated total: 18h 45m."
- "Most active repository: octocat/Hello-World (15 activities)"

### Exporting GitHub Data

1. **Click "Export GitHub Activities"** button
2. **CSV file downloads** with columns:
   - Activity type, repository, description, details
   - Timestamp, estimated time, tracked time
   - URL, correlation data
3. **Use for**:
   - Client billing
   - Project time reports
   - Performance reviews
   - Development analytics

---

## 🔄 Syncing GitHub Activities

### Manual Sync

1. **Go to GitHub tab**
2. **Click "Load GitHub Activities"** or **"🔄 Refresh"**
3. **Data refreshes** with latest events from GitHub API

### What Gets Synced

- **Recent events**: Last 300 public events (GitHub API limit)
- **Event types**: All supported activity types
- **Date range**: Filtered by dashboard date selector
- **Repositories**: All repos you have access to

### Sync Frequency

**Recommendations**:
- **Daily projects**: Sync once per day
- **Active development**: Sync 2-3 times per day
- **Project completion**: Sync before exporting reports
- **API limits**: GitHub allows 5,000 requests/hour (more than enough)

---

## 🔒 Privacy & Security

### Data Storage

- **Token**: Encrypted in Chrome's local storage
- **GitHub activities**: Cached locally, never sent externally
- **Permissions**: Read-only access to your GitHub data
- **No servers**: All processing happens in your browser

### What We Access

- ✅ Your public GitHub events
- ✅ Repository names and metadata
- ✅ Commit counts and PR details
- ✅ Issue and review information
- ✅ Event timestamps

### What We DON'T Access

- ❌ Code contents (only metadata)
- ❌ Private data beyond your permissions
- ❌ Collaborator information
- ❌ Organization secrets
- ❌ Write access to any repos

### Token Security

1. **Minimum permissions**: Only request read access
2. **Local storage**: Token never leaves your device
3. **Encrypted**: Stored securely in browser
4. **Revocable**: Can revoke anytime in GitHub settings
5. **Expiring tokens**: Use 90-day expiration for better security

### Disconnecting GitHub

**To disconnect**:
1. Go to **Settings** → **GitHub Integration**
2. Click **"Disconnect GitHub"** button
3. Token is immediately removed from storage
4. Cached activities are cleared

**Also revoke the token in GitHub**:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Find "TimeTracker Pro Extension" token
3. Click **"Delete"** or **"Revoke"**

---

## 🐛 Troubleshooting

### "Failed to connect to GitHub"

**Possible causes**:
1. **Invalid token**: Token format incorrect or expired
2. **Wrong username**: Username doesn't match token owner
3. **Revoked token**: Token was deleted in GitHub settings
4. **Network error**: Internet connection issues

**Fix**:
- Verify token starts with `ghp_` or `github_pat_`
- Check username is correct (case-sensitive)
- Generate a new token if expired
- Check browser console (F12) for detailed errors

### "No activities showing"

**Check**:
1. **Token configured?** Status should show "Connected"
2. **Date range correct?** Try "This Week" or "This Month"
3. **Recent activity?** Verify you have GitHub events in that period
4. **Permissions?** Ensure token has `read:user` and `repo` scopes

**Note**: GitHub API only provides last 300 public events per user.

### "Incorrect time estimates"

**Understand**:
- Estimates are averages based on typical activity duration
- Your actual time may vary significantly
- Complexity affects duration (simple fix vs major refactor)
- Use browser tracked time for more accurate data

**Customize** (future feature):
- Custom duration estimates per activity type
- Machine learning based on your patterns
- Manual time entry for specific activities

### "Browser tracking doesn't match"

**Reasons**:
- Used GitHub Desktop app (not tracked by browser extension)
- Used git CLI without visiting GitHub.com
- Worked offline and pushed later
- Used different browser

**This is normal** for command-line heavy workflows.

### "API rate limit exceeded"

**Unlikely but possible**:
- GitHub allows 5,000 requests/hour for authenticated users
- If you see this error, wait 1 hour
- Reduce sync frequency
- Check if other apps are using same token

---

## 📊 Best Practices

### For Accurate Time Tracking

1. **Use GitHub web interface** when possible (better browser tracking)
2. **Regular commits**: Push commits throughout the day, not just at end
3. **Sync frequently**: Load activities 2-3 times per day
4. **Combine with manual entries**: Add offline work as manual time entries
5. **Review correlations**: Check tracked vs estimated time regularly

### For Security

1. **Use 90-day expiration**: Regenerate tokens regularly
2. **Minimum scopes**: Only `read:user` + `public_repo` for public work
3. **One token per device**: Don't share tokens across devices
4. **Revoke old tokens**: Clean up unused tokens in GitHub
5. **Monitor activity**: Check GitHub security log for token usage

### For Productivity Insights

1. **Track consistently**: Enable tracking every work day
2. **Review weekly**: Check GitHub Insights once per week
3. **Compare repositories**: See where you spend most time
4. **Identify patterns**: Notice peak activity times
5. **Optimize workflow**: Reduce context switching between repos

### For Reporting

1. **Export regularly**: Download CSV reports for billing/records
2. **Combine data sources**: Merge GitHub + calendar + manual entries
3. **Add tags**: Use manual entries with tags for billable work
4. **Client projects**: Filter by repository for client reporting
5. **Time periods**: Use consistent date ranges (weekly/monthly)

---

## 🚀 Advanced Features

### Combining GitHub + Browser Tracking

**Best approach**:
1. Let browser track all GitHub.com activity automatically
2. Sync GitHub events for metadata (what you did)
3. Correlate the two for complete picture:
   - GitHub events: WHAT you did
   - Browser tracking: HOW LONG you spent

**Example workflow**:
```
9:00 AM - Open github.com (browser starts tracking)
9:15 AM - Create PR #123 (GitHub event logged)
9:45 AM - Review PR #119 (GitHub event logged)
10:30 AM - Close browser (browser session ends)

Result:
- Browser: 1h 30m on GitHub.com
- GitHub: 2 events (1h PR + 45m review = 1h 45m estimated)
- Correlation: Good match (85% coverage)
```

### Using with Manual Time Entries

**For offline work**:
1. Work on code locally (no GitHub events yet)
2. Add manual time entry: "Development - Feature X" (2 hours)
3. Push commits later (GitHub events logged)
4. Both tracked separately, export together

**Tagging strategies**:
- Tag GitHub activities with project/client names
- Use manual entries for: planning, debugging, local testing
- GitHub events for: commits, PRs, reviews, issues

### Repository-Based Reporting

**Filter by repo**:
1. Export all GitHub activities
2. Filter CSV by repository column
3. Sum time by repository
4. Use for project billing or time allocation

**Example**:
- `client-project-a`: 40h (billable)
- `internal-tools`: 15h (non-billable)
- `open-source`: 8h (personal)

---

## 🎯 Integration with Other Features

### GitHub + Calendar Integration

**Track development meetings**:
- Calendar: Shows standup, planning, review meetings
- GitHub: Shows actual development work between meetings
- Combined: Complete picture of development time

**Example day**:
```
9:00 AM - Standup meeting (Calendar: 15m)
9:30 AM - Code review (GitHub: 45m)
11:00 AM - Sprint planning (Calendar: 1h)
1:00 PM - Feature development (GitHub: 3h)
4:00 PM - PR review meeting (Calendar: 30m)
```

### GitHub + Manual Time Entries

**Use manual entries for**:
- Local development (before pushing)
- Code planning and architecture
- Debugging and testing
- Documentation writing
- Research and learning

**Use GitHub events for**:
- Commits and pushes
- Pull requests
- Code reviews
- Issue management

### GitHub + Tags

**Tag your manual entries**:
- `github-work`: Related to GitHub activities
- `offline-dev`: Local development time
- `code-review`: Manual review time (supplement GitHub)
- `client-name`: Associate GitHub work with clients
- `project-name`: Group by project

---

## 📞 Need Help?

### Resources

- Main [README.md](README.md) - Extension overview
- [CALENDAR_SETUP_GUIDE.md](CALENDAR_SETUP_GUIDE.md) - Calendar integration
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - General usage
- [MANUAL_ENTRIES_GUIDE.md](MANUAL_ENTRIES_GUIDE.md) - Manual time tracking

### Common Questions

**Q: Does this track my code?**
A: No, only metadata (commits, PRs, issues). No code content is accessed.

**Q: Can I use fine-grained tokens?**
A: Yes, but classic tokens are recommended for broader compatibility.

**Q: What about private repos?**
A: Use `repo` scope instead of `public_repo` to access private repos.

**Q: How often should I sync?**
A: 2-3 times per day for active projects, once daily for maintenance.

**Q: Can I track organization repos?**
A: Yes, add `read:org` scope to your token.

### Support

- Check browser console (F12) for errors
- Verify token permissions in GitHub
- Review this guide for troubleshooting
- Submit issues on GitHub with error details

---

## ✅ Quick Reference

### GitHub Token Setup
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Add scopes: `read:user`, `repo` (or `public_repo`)
4. Copy token (starts with `ghp_` or `github_pat_`)
5. **Paste in Dashboard → Settings → GitHub Integration**
6. Click "Save GitHub Credentials"

### Using GitHub Integration
1. Configure token in Settings (one-time setup)
2. Go to GitHub tab in dashboard
3. Click "Load GitHub Activities"
4. View activities, insights, and correlations
5. Export data with "Export GitHub Activities"

### Best Practices
- Use 90-day token expiration
- Sync 2-3 times per day
- Combine with browser tracking
- Add manual entries for offline work
- Review insights weekly

**💡 Key Advantage**: Track development work automatically with $0 cost!

---

**Happy coding and tracking! 🐙⏱️**
