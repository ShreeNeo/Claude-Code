# Neram - Usage Guide

## 🎯 New Features Overview

Your extension now includes:
1. **Dummy Data Visualization** - See how your data will look before you start tracking
2. **Data Toggle** - Switch between dummy and real data instantly
3. **Employee Profile** - Configure your details for timesheet export
4. **CSV Export** - Export in your specified format with employee details

---

## 📊 Viewing Dummy Data

### What is Dummy Data?
The extension generates **7 days of realistic tracking data** to show you how the dashboard will look when you accumulate real browsing data.

### Features of Dummy Data:
- **70+ sessions** across 12 different websites
- **Realistic time distribution** (9 AM - 6 PM work hours)
- **Multiple categories**: Development, Work, Social Media, Entertainment, etc.
- **All charts populated**: Daily trends, category breakdown, hourly heatmap
- **Full statistics**: Productivity scores, focus scores, insights

### How to View Dummy Data:

1. **Open the extension** and click "Open Dashboard"
2. **Dummy data is ON by default** - you'll see data immediately
3. **Explore all tabs**:
   - **Overview**: Stats cards, daily chart, category pie chart, top domains table
   - **Analytics**: Hourly heatmap, weekly comparison, AI insights
   - **Categories**: Breakdown by category with time and percentages

### Example Dummy Data You'll See:

**Overview Tab:**
- Total Time: ~35-45 hours (over 7 days)
- Productivity Score: ~68%
- Focus Score: ~72%
- Sessions: ~70 sessions
- Top domains: github.com, stackoverflow.com, youtube.com, etc.

**Charts:**
- Line chart showing daily activity across the week
- Pie chart with category breakdown
- Bar chart showing hourly patterns
- Weekly comparison bars

---

## 🔄 Toggle Between Dummy and Real Data

### The Toggle Switch
Located in the **top-right corner** of the dashboard header, next to the date range selector.

### How to Use:

1. **Dummy Data ON (Checked)**: Shows generated demo data
   - Perfect for: Demos, presentations, seeing what's possible
   - No real tracking needed

2. **Dummy Data OFF (Unchecked)**: Shows your actual tracking data
   - Shows real sessions from your browsing
   - If no data yet, displays helpful "Start tracking" message

### When to Use Each Mode:

**Use Dummy Data When:**
- First time installing the extension
- Showing the extension to others
- Understanding how data will be visualized
- Testing the export feature
- Creating presentations

**Use Real Data When:**
- Actively tracking your time
- Analyzing your actual productivity
- Exporting real timesheet data
- Monitoring your browsing patterns

---

## 👤 Configuring Your Employee Profile

### Why Configure Employee Profile?
Your employee details are required for the CSV export to match your company's timesheet format.

### How to Configure:

1. **Open Dashboard** → Click **Settings** tab
2. **Scroll to "Employee Profile"** section
3. **Fill in all fields**:

   ```
   Employee Code:    neo10013
   Employee Name:    SHREEHARAN
   Company Code:     N080
   Practice:         Product Management
   Product Name:     NeoPAT 2.0
   Project/Client:   NeoPAT 2.0
   ```

4. **Click "Save Settings"** at the bottom
5. **Confirmation**: You'll see "Settings saved successfully!"

### Field Descriptions:

| Field | Description | Example |
|-------|-------------|---------|
| **Employee Code** | Your unique employee ID | neo10013 |
| **Employee Name** | Your full name (uppercase) | SHREEHARAN |
| **Company Code** | Your company identifier | N080 |
| **Practice** | Your department/practice | Product Management |
| **Product Name** | Default product you work on | NeoPAT 2.0 |
| **Project/Client** | Default project or client | NeoPAT 2.0 |

### Important Notes:
- All fields are **saved to Chrome storage**
- Data **syncs across devices** (if Chrome sync enabled)
- **Required for export** - you'll be prompted if incomplete
- Can be updated anytime from Settings

---

## 💾 Exporting Timesheet Data

### Export Format
The extension exports data in **tab-separated CSV format** that matches your specified structure:

```
Emp Code	Emp Name	Company Code	Practice	Product Name	Project/Client	Task/Description	Working Hours (8H)	Logged Date
neo10013	SHREEHARAN	N080	Product Management	NeoPAT 2.0	NeoPAT 2.0	Development work on github.com	1.50	6-Oct-25
neo10013	SHREEHARAN	N080	Product Management	NeoPAT 2.0	NeoPAT 2.0	Work & Productivity work on gmail.com	0.50	6-Oct-25
```

### How to Export:

#### Step 1: Configure Employee Profile (if not done)
- Go to Settings → Employee Profile
- Fill in all required fields
- Click "Save Settings"

#### Step 2: Choose Your Data
- Toggle **Dummy Data ON** to export sample data (for testing)
- Toggle **Dummy Data OFF** to export real tracking data

#### Step 3: Export
1. Click **"💾 Export Data"** button in the sidebar
2. If profile incomplete, you'll be redirected to Settings
3. If data available, file downloads automatically
4. Filename format: `timesheet_neo10013_2025-11-14.csv`

### What Gets Exported:

Each session becomes one row:
- **Emp Code**: From your profile
- **Emp Name**: From your profile
- **Company Code**: From your profile
- **Practice**: From your profile
- **Product Name**: From your profile (or category if blank)
- **Project/Client**: From your profile (or website domain if blank)
- **Task/Description**: Auto-generated (e.g., "Development work on github.com")
- **Working Hours (8H)**: Calculated hours in decimal (e.g., 1.50 = 1 hour 30 minutes)
- **Logged Date**: Formatted as DD-MMM-YY (e.g., 14-Nov-25)

### Opening Exported File:

**In Excel:**
1. Open Excel
2. File → Open → Select your CSV file
3. Data should auto-format into columns
4. If not, use "Text to Columns" with Tab delimiter

**In Google Sheets:**
1. Open Google Sheets
2. File → Import → Upload
3. Select your CSV file
4. Choose "Tab" as separator

---

## 🎨 Understanding the Dashboard

### Overview Tab

**Stats Cards (Top):**
- **Total Time**: Total hours across all sessions
- **Productivity Score**: 0-100 score based on productive vs unproductive sites
- **Focus Score**: Based on session length and context switching
- **Sessions**: Total number of tracking sessions

**Daily Activity Chart:**
- Line chart showing hours per day
- Hover over points to see exact times
- Shows weekly trends

**Category Breakdown Chart:**
- Pie/donut chart showing time by category
- Color-coded categories
- Click legend to toggle categories

**Top Domains Table:**
- Searchable table of your most-visited sites
- Shows category, time, visits, percentage
- Click headers to sort

### Analytics Tab

**Hourly Activity Heatmap:**
- Bar chart showing activity by hour (0-23)
- Identifies your peak productive hours
- Helps schedule important work

**Weekly Comparison:**
- Bar chart comparing days of the week
- See which days you're most/least active
- Identify patterns in your week

**Insights & Recommendations:**
- AI-generated insights about your usage
- Productivity tips
- Peak hour identification
- Top site analysis

### Categories Tab

**Category Cards:**
- One card per category (Development, Social Media, etc.)
- Shows total time, visits, percentage
- Color-coded progress bars
- Sortable by time spent

### Settings Tab

**Employee Profile:**
- Configure your employee details
- Required for CSV export

**Tracking Settings:**
- Enable/disable tracking
- Set idle timeout (minutes)

**Focus Mode:**
- Enable alerts for distracting sites
- Set time threshold (minutes)

**Blacklist:**
- Exclude specific domains from tracking
- Add/remove domains easily

**Data Management:**
- Clear all tracking data
- Reset to dummy data

---

## 🎯 Quick Start Workflow

### For First-Time Users:

1. **Install Extension** (see INSTALLATION.md)
2. **Open Dashboard** - See dummy data immediately
3. **Explore All Tabs** - Understand what data will be collected
4. **Configure Profile** - Go to Settings → Employee Profile
5. **Test Export** - Export dummy data to see CSV format
6. **Start Tracking** - Toggle dummy data OFF and start browsing

### For Daily Use:

1. **Browse Normally** - Extension tracks automatically
2. **Check Stats** - Click extension icon for quick view
3. **Review Dashboard** - Weekly reviews for insights
4. **Export Timesheet** - End of week/month for reporting

### For Presentations/Demos:

1. **Enable Dummy Data** - Toggle ON
2. **Show Dashboard** - Full visualization instantly
3. **Demonstrate Export** - Show CSV format
4. **Explain Features** - Categories, productivity scores, etc.

---

## 💡 Pro Tips

### Maximizing Productivity Insights:

1. **Review Weekly**: Check Analytics tab every Monday
2. **Identify Patterns**: Use hourly heatmap to find peak hours
3. **Set Goals**: Use Focus Mode to limit distracting sites
4. **Track Projects**: Use blacklist to exclude non-work sites

### Export Best Practices:

1. **Configure Profile Once**: Set it up and forget it
2. **Export Weekly**: Regular exports for timesheets
3. **Use Dummy for Testing**: Test your import process first
4. **Keep Backup**: Export before clearing data

### Data Management:

1. **90-Day Retention**: Data auto-cleans after 90 days
2. **Manual Cleanup**: Use "Clear All Data" when needed
3. **Privacy First**: Banking/healthcare sites auto-excluded
4. **Blacklist Sensitive Sites**: Add personal sites to blacklist

---

## ❓ Frequently Asked Questions

### Q: How do I switch between dummy and real data?
**A:** Use the toggle switch in the top-right corner of the dashboard header.

### Q: Why can't I export data?
**A:** Make sure your employee profile is complete in Settings.

### Q: What if I have no real tracking data yet?
**A:** Use dummy data to see how the extension works, then toggle it off and start browsing.

### Q: How are working hours calculated?
**A:** Duration is converted to decimal hours (e.g., 90 minutes = 1.50 hours).

### Q: Can I customize the task descriptions?
**A:** Currently auto-generated from category + domain. Manual editing coming in future update.

### Q: What date format is used for export?
**A:** DD-MMM-YY format (e.g., 6-Oct-25) as specified.

### Q: How do I add my own categories?
**A:** Coming in future update. Currently uses 11 pre-defined categories.

### Q: Will my employee profile sync across computers?
**A:** Yes, if Chrome Sync is enabled.

### Q: How often should I export data?
**A:** Weekly or monthly, depending on your company's timesheet requirements.

### Q: Can I export real and dummy data separately?
**A:** Yes! Toggle between modes before exporting.

---

## 🆘 Troubleshooting

### "Please complete your employee profile"
- Go to Settings → Employee Profile
- Fill in all 6 fields
- Click "Save Settings"

### No data showing when dummy data is OFF
- This is expected if you haven't started tracking yet
- Toggle dummy data ON to see how it will look
- Start browsing with tracking enabled

### Export file not opening in Excel
- File is tab-separated (TSV) format
- Use "Text to Columns" with Tab delimiter
- Or import as CSV in Google Sheets

### Charts not displaying
- Refresh the dashboard
- Check browser console for errors (F12)
- Try reloading the extension

### Toggle not working
- Make sure JavaScript is enabled
- Check browser console for errors
- Reload the dashboard page

---

## 📞 Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [INSTALLATION.md](INSTALLATION.md)
- Submit issues on GitHub

---

**Enjoy tracking your time and maximizing productivity! ⏱️**
