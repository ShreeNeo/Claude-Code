# Manual Time Entries & Tags Guide

## ✏️ Overview

TimeTracker Pro now supports **Manual Time Entries** and **Tags**, giving you complete control over your time tracking:
- Add time entries manually for work done outside the browser
- Edit any time entry (automatic or manual)
- Categorize entries with custom tags
- Filter and organize entries by tags
- Combine automatic tracking with manual entries
- Export comprehensive time reports with all entries

---

## 🎯 Why Manual Time Entries?

### Automatic Tracking Limitations

While TimeTracker Pro automatically tracks browser activity, some work isn't captured:
- ❌ IDE/code editor time (VS Code, IntelliJ, etc.)
- ❌ Command-line work (terminal, git commands)
- ❌ Design tools (Figma, Sketch, Photoshop)
- ❌ Meetings in desktop apps (Zoom app, Teams app)
- ❌ Offline work (no internet, airplane mode)
- ❌ Mobile device work
- ❌ Paper-based planning and sketching

### Manual Entries Fill the Gaps

With manual entries, you can:
- ✅ Track **ALL** your work, not just browser time
- ✅ Add entries for IDE development time
- ✅ Log terminal/command-line work
- ✅ Record offline meetings and planning
- ✅ Capture design and creative work
- ✅ Edit automatic entries if needed
- ✅ Have complete, accurate time reports

---

## ➕ Adding Manual Time Entries

### Step 1: Open Time Entries Tab

1. **Click extension icon** → **Open Dashboard**
2. **Go to "Time Entries" tab** (✏️ icon)
3. **Click "➕ Add Manual Time Entry"** button

### Step 2: Fill in Entry Details

A modal form will appear with these fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Date** | Day the work was done | `2025-01-14` |
| **Start Time** | When you started | `09:00 AM` |
| **Duration** | How long (in minutes) | `120` (2 hours) |
| **Description** | What you worked on | `Implemented user authentication` |
| **Category** | Type of work | `Development`, `Meeting`, `Design` |
| **Tags** | Custom labels (comma-separated) | `client-work, backend, urgent` |

### Step 3: Save Entry

1. **Fill in all required fields** (marked with *)
2. **Click "Save Entry"**
3. **Entry appears in the table** below
4. **Modal closes automatically**

### Example Manual Entries

**Example 1 - IDE Development**:
```
Date: 2025-01-14
Start Time: 09:00
Duration: 180 minutes (3 hours)
Description: Refactored database queries for performance
Category: Development
Tags: backend, optimization, client-a
```

**Example 2 - Design Work**:
```
Date: 2025-01-14
Start Time: 14:00
Duration: 90 minutes (1.5 hours)
Description: Created wireframes for dashboard redesign
Category: Design
Tags: ui-ux, planning, figma
```

**Example 3 - Offline Meeting**:
```
Date: 2025-01-14
Start Time: 11:00
Duration: 60 minutes (1 hour)
Description: Sprint planning with team
Category: Meeting
Tags: agile, team, planning
```

---

## ✏️ Editing Time Entries

### Editing Manual Entries

1. **Go to Time Entries tab**
2. **Find the entry** you want to edit
3. **Click "✏️ Edit" button** in the Actions column
4. **Modal opens** with pre-filled fields
5. **Modify any fields** as needed
6. **Click "Save Entry"**
7. **Entry updates immediately**

### Editing Automatic Entries

You can also edit automatically tracked browser sessions:

**Why edit automatic entries?**
- Fix incorrect duration (if browser was idle)
- Add description for context
- Change category if misclassified
- Add tags for better organization
- Remove unwanted entries (accidental tracking)

**How to edit**:
1. Same process as manual entries
2. Click "✏️ Edit" on any entry
3. Notice "Type" column shows "Automatic" vs "Manual"
4. Modify fields and save

**Note**: Edited automatic entries still show as "Automatic" type but will have an "updatedAt" timestamp.

---

## 🗑️ Deleting Time Entries

### Delete Manual Entries

1. **Find the entry** in Time Entries table
2. **Click "🗑️ Delete" button**
3. **Confirm deletion** in popup
4. **Entry removed immediately**

**Warning**: Deletion is permanent! Export data before deleting important entries.

### Delete Automatic Entries

- Currently, automatic browser sessions cannot be deleted
- You can edit them to modify duration/description
- Future feature: Option to exclude specific sessions from reports

---

## 🏷️ Using Tags

### What are Tags?

Tags are custom labels you create to organize and categorize your time entries:
- **Flexible categorization** beyond built-in categories
- **Filter entries** by tag to see related work
- **Color-coded** for visual organization
- **Reusable** across multiple entries
- **Searchable** for reporting

### Tag Examples

**By Client**:
- `client-a`, `client-b`, `internal`

**By Project**:
- `website-redesign`, `mobile-app`, `api-v2`

**By Priority**:
- `urgent`, `high-priority`, `low-priority`

**By Type**:
- `billable`, `non-billable`, `overtime`

**By Technology**:
- `react`, `python`, `database`, `devops`

**By Status**:
- `in-progress`, `completed`, `blocked`

---

## 🎨 Managing Tags

### Creating Tags

**Method 1: Via Manual Entry**
1. When adding/editing an entry
2. Type new tag names in the Tags field
3. Tags are created automatically
4. Default color assigned

**Method 2: Via Tags Manager**
1. **Click "🏷️ Manage Tags" button** in Time Entries tab
2. **Click "➕ Add New Tag"**
3. **Fill in details**:
   - Tag name (e.g., `client-work`)
   - Color (pick from color picker)
4. **Click "Add Tag"**
5. Tag appears in the list

### Customizing Tag Colors

1. **Open Tags Manager** (🏷️ button)
2. **Find the tag** you want to customize
3. **Click color box** next to tag name
4. **Pick a new color** from the color picker
5. **Click "Save"**
6. Color updates across all entries using that tag

**Color suggestions**:
- 🔴 Red: Urgent, high-priority
- 🟢 Green: Completed, approved
- 🔵 Blue: Client work, billable
- 🟡 Yellow: In progress, pending
- 🟣 Purple: Internal, non-billable
- 🟠 Orange: Review needed

### Viewing Tag Statistics

In the Tags Manager modal:
- **Usage Count**: How many entries use each tag
- **Most used tags**: Sorted by usage
- **Unused tags**: Tags created but not used yet

### Deleting Tags

1. **Open Tags Manager**
2. **Find the tag** to delete
3. **Click "🗑️ Delete"**
4. **Confirm deletion**
5. **Tag removed** from all entries

**Warning**: This removes the tag from ALL entries that use it!

---

## 🔍 Filtering Time Entries

### Filter by Tag

1. **Go to Time Entries tab**
2. **Use the "Filter by Tag" dropdown**
3. **Select a tag** from the list
4. **Table updates** to show only entries with that tag
5. **Select "All Tags"** to clear filter

### Filter by Date Range

Use the dashboard's main date range selector:
1. **Top of dashboard** has date range controls
2. **Choose**: Today, This Week, This Month
3. **All tables update** including Time Entries

### Filter by Category

1. **Click category header** in table
2. **Table sorts** by category
3. **Scroll to find** specific category entries

### Search Entries

1. **Use browser's Find** (Ctrl+F / Cmd+F)
2. **Search** for keywords in description
3. **Navigate** through matches

---

## 📊 Time Entries Table

### Table Columns

| Column | Description |
|--------|-------------|
| **Date** | Day of the activity |
| **Time** | Start time of the activity |
| **Duration** | How long it lasted (HH:MM format) |
| **Description** | What was done (manual) or page title (automatic) |
| **Category** | Type of work (Development, Meeting, etc.) |
| **Tags** | Custom labels (color-coded badges) |
| **Type** | "Manual" or "Automatic" |
| **Actions** | Edit and Delete buttons |

### Sorting Entries

- **Click column headers** to sort
- **Default**: Most recent first (by date + time)
- **Click again** to reverse sort order

### Understanding Entry Types

**Manual Entries**:
- Type: "Manual" badge
- Added by you
- Full control over all fields
- Can be edited or deleted anytime

**Automatic Entries**:
- Type: "Automatic" badge
- Created by browser tracking
- Based on actual browser activity
- Can be edited but not deleted (currently)

---

## 📤 Exporting Time Entries

### Export All Entries

1. **Go to Settings tab** → **Data Management**
2. **Click "Export Data" button**
3. **Select format**: CSV or JSON
4. **File downloads** with all entries:
   - Manual entries
   - Automatic browser sessions
   - GitHub activities (if configured)
   - Calendar meetings (if configured)
   - Tags included

### Export Filtered Entries

1. **Apply filters** (by tag, date range)
2. **Export using Employee Timesheet**:
   - Go to Settings → Employee Profile
   - Fill in your details
   - Click "Generate Timesheet"
3. **CSV includes** only filtered/visible entries

### CSV Format

```csv
Date,Start Time,End Time,Duration,Description,Category,Tags,Type,Domain/Source
2025-01-14,09:00,12:00,3h 0m,Refactored database queries,Development,"backend,client-a",Manual,N/A
2025-01-14,14:00,15:30,1h 30m,Created wireframes,Design,"ui-ux,figma",Manual,N/A
2025-01-14,16:00,17:15,1h 15m,Code review on GitHub,Development,github-work,Automatic,github.com
```

---

## 💡 Best Practices

### When to Use Manual Entries

**Always add manual entries for**:
1. ✅ IDE/code editor work (VS Code, PyCharm, etc.)
2. ✅ Terminal/command-line sessions
3. ✅ Design tool usage (Figma, Sketch, etc.)
4. ✅ Offline meetings (Zoom desktop, in-person)
5. ✅ Planning and documentation (offline)
6. ✅ Mobile device work
7. ✅ Any non-browser work time

**Don't duplicate automatic tracking**:
- ❌ If github.com is already tracked, don't add manual entry
- ❌ Check Time Entries table for existing automatic entries
- ✅ Use tags to enhance automatic entries instead

### Tag Organization Strategies

**Strategy 1: Client-Based**
```
Tags: client-a, client-b, client-c, internal
Use for: Billing reports per client
```

**Strategy 2: Project-Based**
```
Tags: project-alpha, project-beta, maintenance, research
Use for: Time allocation per project
```

**Strategy 3: Billability**
```
Tags: billable, non-billable, overtime, pro-bono
Use for: Invoice generation
```

**Strategy 4: Technology Stack**
```
Tags: frontend, backend, database, devops, mobile
Use for: Skill development tracking
```

**Strategy 5: Agile Workflow**
```
Tags: sprint-23, feature, bugfix, testing, review
Use for: Sprint reports and velocity
```

### Entry Description Guidelines

**Good descriptions**:
- ✅ `Implemented OAuth authentication for login page`
- ✅ `Fixed bug #234: User profile not saving`
- ✅ `Reviewed PR #89: Database migration changes`
- ✅ `Sprint planning meeting - Q1 roadmap`

**Poor descriptions**:
- ❌ `Work`
- ❌ `Coding`
- ❌ `Meeting`
- ❌ `Stuff`

**Tips**:
- Be specific about what was accomplished
- Include ticket/issue numbers if applicable
- Mention key outcomes or deliverables
- Use consistent format across entries

### Accuracy Tips

1. **Add entries same day**: Don't wait until end of week
2. **Set reminders**: Add entry after each major task
3. **Round to 15 min intervals**: 1h 15m, 1h 30m, 1h 45m
4. **Use timers**: Start timer when beginning work, add entry when done
5. **Review daily**: Check Time Entries table each evening
6. **Compare with calendar**: Cross-reference with meeting schedule
7. **Account for breaks**: Don't include lunch/coffee breaks

---

## 🔗 Integration with Other Features

### Manual Entries + Automatic Tracking

**Perfect combination**:
```
Day Overview:
- 9:00-10:30: Browser tracked github.com (Automatic: 1h 30m)
- 10:30-12:00: VS Code development (Manual: 1h 30m) [tagged: offline-dev]
- 13:00-14:00: Team meeting via Zoom app (Manual: 1h) [tagged: meeting]
- 14:00-17:00: Browser tracked stackoverflow.com, docs (Automatic: 3h)
- 17:00-18:00: Local testing (Manual: 1h) [tagged: testing]

Total: 8h 0m (complete picture!)
```

### Manual Entries + GitHub Integration

**Complement GitHub events**:
```
GitHub Event: Pushed 3 commits at 15:30 (Estimated: 30m)
Manual Entry: Local development before push: 14:00-15:30 (Actual: 1h 30m)
Total development time: 2h (accurate!)
```

### Manual Entries + Calendar Integration

**Fill meeting gaps**:
```
Calendar: Sprint Planning 10:00-11:00 (browser tracked: 45m)
Manual Entry: Offline discussion after meeting: 11:00-11:30 (30m)
Total meeting time: 1h 30m (complete)
```

### Tags + Exporting

**Filter and export**:
1. Filter by tag: `client-a`
2. Filter date range: This Month
3. Export timesheet
4. Invoice client for all `client-a` work

---

## 🎯 Use Cases

### Freelancer Billing

**Setup**:
- Tags: `client-a`, `client-b`, `client-c`, `internal`
- Categories: Development, Design, Meeting, Planning
- Manual entries: All offline work

**Monthly billing**:
1. Filter by client tag
2. Filter by month
3. Export CSV
4. Calculate billable hours
5. Generate invoice

**Example report**:
```
Client A - January 2025:
- Development: 40h @ $100/h = $4,000
- Design: 10h @ $100/h = $1,000
- Meetings: 5h @ $100/h = $500
Total: 55h = $5,500
```

### Employee Timesheet

**Setup**:
- Categories: Development, Meetings, Training, Admin
- Tags: `project-alpha`, `project-beta`, `overhead`
- Manual + Automatic entries

**Weekly timesheet**:
1. Filter by week
2. Go to Settings → Employee Profile
3. Fill in employee details
4. Generate Timesheet
5. Submit to manager

### Project Time Tracking

**Setup**:
- Tags: `website-redesign`, `mobile-app`, `api-v2`
- Track all project-related work

**Project report**:
1. Filter by project tag
2. See total time spent
3. Break down by category
4. Export for project management

**Example**:
```
Website Redesign Project:
- Design: 20h
- Development: 60h
- Testing: 15h
- Meetings: 10h
Total: 105h (project status: 70% complete)
```

### Skill Development Tracking

**Setup**:
- Tags: `learning`, `python`, `react`, `aws`, `sql`
- Manual entries for tutorials, courses, practice

**Monthly review**:
1. Filter by learning tags
2. See time invested in skill development
3. Track progress over months
4. Plan future learning

---

## 🐛 Troubleshooting

### "Cannot save entry"

**Check**:
1. All required fields filled (*marked)
2. Date is valid format
3. Duration is positive number
4. Description not empty

### "Entry not appearing in table"

**Possible causes**:
1. **Date outside selected range**: Change date filter
2. **Tag filter active**: Clear tag filter or select "All Tags"
3. **Browser cache**: Refresh page (F5)

### "Tags not showing colors"

**Fix**:
1. Open Tags Manager
2. Click on tag
3. Set color using color picker
4. Save changes
5. Refresh page

### "Duplicate entries"

**Avoid duplicates**:
1. Check Time Entries table for existing automatic entry
2. Don't add manual entry if browser already tracked it
3. Instead, edit automatic entry to add tags/description

### "Cannot delete automatic entry"

**Expected behavior**:
- Automatic browser sessions cannot be deleted (by design)
- You can edit them instead
- Use tags to mark entries to exclude from reports

**Workaround**:
- Edit entry and set duration to 0
- Or tag it with `exclude` and filter it out

---

## 📞 Need Help?

### Resources

- Main [README.md](README.md) - Extension overview
- [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md) - GitHub integration
- [CALENDAR_SETUP_GUIDE.md](CALENDAR_SETUP_GUIDE.md) - Calendar integration
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - General usage

### Support

- Check browser console (F12) for errors
- Review this guide for best practices
- Submit issues on GitHub with details

---

## ✅ Quick Reference

### Adding Manual Entry
1. Time Entries tab → "➕ Add Manual Time Entry"
2. Fill: Date, Time, Duration, Description, Category
3. Add tags (optional): `tag1, tag2, tag3`
4. Save Entry

### Managing Tags
1. Time Entries tab → "🏷️ Manage Tags"
2. Add new tag with name and color
3. View usage statistics
4. Delete unused tags

### Filtering & Exporting
1. Filter by tag using dropdown
2. Filter by date range using main controls
3. Export: Settings → Data Management → Export Data
4. Or: Settings → Generate Timesheet (for formatted report)

### Best Practices
- Add manual entries daily
- Use descriptive descriptions
- Tag consistently across entries
- Review entries weekly
- Export monthly for records

**💡 Complete time tracking = Automatic browser tracking + Manual entries + Tags!**

---

**Happy time tracking! ✏️⏱️**
