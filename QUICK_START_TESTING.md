# Quick Start Testing Guide

**Time Required**: 10 minutes
**Goal**: Verify basic functionality of all 5 tabs

---

## Step 1: Start the Application (1 min)

```bash
# Make sure you're in the project directory
cd /Users/mohamednasser/Documents/morita/morita_dashboard

# Start development server
npm run dev

# Expected output:
# ✓ Ready on http://localhost:3001
```

✅ **Checkpoint**: Server running without errors

---

## Step 2: Open the Dashboard (1 min)

1. Open browser: `http://localhost:3001/kpis`
2. Press F12 to open DevTools
3. Click **Console** tab

✅ **Checkpoint**: No red errors in console

---

## Step 3: Test Each Tab (5 min)

### Overview Tab (30 sec)
```
URL: http://localhost:3001/kpis?tab=overview
```
**Quick Check**:
- [ ] See 4 metric cards (Revenue, Profit, Members, Response Time)
- [ ] Numbers appear (not "Loading..." forever)
- [ ] Click any card → Navigates to another tab

**If shows 0**: That's OK if you have no data yet

---

### Community Tab (1 min)
```
URL: http://localhost:3001/kpis?tab=community
```
**Quick Check**:
- [ ] See section: "📊 Member Growth & Retention"
- [ ] See period buttons: Daily, Weekly, Monthly, Quarterly, Yearly
- [ ] Click "Weekly" → Data updates (or stays same if empty)
- [ ] Scroll down → See more KPI sections

---

### Support Tab (1 min)
```
URL: http://localhost:3001/kpis?tab=support
```
**Quick Check**:
- [ ] See section: "⏱️ Support First Response Time"
- [ ] See "SLA Target (minutes): 15" input field
- [ ] Change to 10 → Press Enter
- [ ] See period selector buttons
- [ ] Scroll down → See more KPI sections

---

### Operations Tab (1 min)
```
URL: http://localhost:3001/kpis?tab=operations
```
**Quick Check**:
- [ ] See section: "⚠️ Order Issues & Reports"
- [ ] See period selector
- [ ] Scroll down → Count 6 total KPI sections
- [ ] All 6 sections are visible

Expected sections:
1. Order Issues & Reports
2. Order Completion Time
3. Service Request Measurement
4. Service Request Conversion Rate
5. Worker Performance Metrics
6. Worker Issue Tracking

---

### Financial Tab (1 min)
```
URL: http://localhost:3001/kpis?tab=financial
```
**Quick Check**:
- [ ] See section: "💰 Revenue, Expenses & Net Profit"
- [ ] See 5 period buttons
- [ ] See 4 metric cards:
  - Total Revenue (blue icon)
  - Gross Profit (green icon)
  - Total Expenses (red icon)
  - Net Profit (green or red icon)
- [ ] See "Financial Insights" card at bottom

---

## Step 4: Test Period Selectors (2 min)

Pick any tab (e.g., Support) and test:

1. **Click "Daily"**
   - [ ] Button highlights in blue
   - [ ] Data updates (watch Network tab)

2. **Click "Monthly"**
   - [ ] Button highlights in blue
   - [ ] Data updates

3. **Click "Yearly"**
   - [ ] Button highlights in blue
   - [ ] Data updates

✅ **Checkpoint**: Period selector buttons change active state and trigger data refresh

---

## Step 5: Check API Calls (1 min)

In DevTools:
1. Click **Network** tab
2. Filter: `Fetch/XHR`
3. Click Community tab
4. Look for requests to `/kpi/...`

**Expected**:
- [ ] See 3 requests:
  - `/kpi/member-growth?period=monthly`
  - `/kpi/repeat-customers?period=monthly`
  - `/kpi/discord-engagement?period=monthly`
- [ ] All show status: `200 OK`
- [ ] Response time < 2 seconds

**If see errors**:
- Status 404: Backend endpoint missing
- Status 500: Backend error
- Failed: Backend not running

---

## Step 6: Test Mobile View (1 min)

1. In DevTools, click **Toggle Device Toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
2. Select device: **iPhone SE**
3. Navigate to any tab

**Quick Check**:
- [ ] Tab navigation visible at top
- [ ] Metric cards stack vertically (one per row)
- [ ] Period selector buttons visible
- [ ] Can scroll to see all content
- [ ] No horizontal scroll on page

✅ **Checkpoint**: Mobile view works without breaking layout

---

## Step 7: Final Verification (1 min)

Go back to **Console** tab in DevTools.

**Check for errors**:
- [ ] No red errors
- [ ] No "Failed to load..." messages
- [ ] No "undefined" or "null" warnings

**If you see warnings** (yellow):
- Some warnings are OK (e.g., React key warnings)
- Red errors are NOT OK

---

## Results

### ✅ SUCCESS - All systems working if:
- All 5 tabs load
- Period selectors work
- API calls return 200 status
- No critical console errors
- Mobile view displays correctly

### ⚠️ PARTIAL SUCCESS if:
- Tabs load but show "0" or "No data"
  - **Reason**: Database is empty
  - **Solution**: Add test data to database

- Some charts don't appear
  - **Reason**: No data for that period
  - **Solution**: Try different period (Yearly = widest range)

### ❌ FAILURE if:
- Tabs don't load at all
  - **Check**: Is backend running?
  - **Check**: Are API endpoints correct?

- Console shows red errors
  - **Action**: Copy error message
  - **Action**: Check TESTING_GUIDE.md → Troubleshooting section

---

## Common Issues & Quick Fixes

### Issue 1: "Failed to load data" on all tabs
**Fix**:
```bash
# Check if backend is running
curl http://localhost:YOUR_BACKEND_PORT/api/kpi/member-growth?period=monthly

# If fails, start backend server
```

### Issue 2: Period selector buttons have no style
**Fix**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 3: Charts not showing
**Fix**:
- Check if data exists for selected period
- Try "Yearly" period (widest date range)
- Check console for errors

### Issue 4: Tables empty
**Fix**:
- Verify database has records
- Check API response in Network tab
- Try different period

---

## Next Steps

### If Everything Works ✅
1. Proceed to full testing: See `TESTING_GUIDE.md`
2. Use checklist: See `TESTING_CHECKLIST.md`
3. Test with real data scenarios

### If Issues Found ❌
1. Document issues:
   - Which tab?
   - What error?
   - Screenshot?
2. Check `TESTING_GUIDE.md` → Troubleshooting
3. Fix and re-test

---

## Testing with Sample Data

If your database is empty, you can verify the UI works by checking these states:

### Empty State (No Data)
**Expected behavior**:
- Metric cards show: $0.00, 0, 0%
- Charts show: "No data available"
- Tables show: "No records found"
- No errors in console

This is **CORRECT** behavior when database is empty.

### With Data
**Expected behavior**:
- Metric cards show real numbers
- Charts display with data points
- Tables show records
- Period selector changes affect displayed data

---

## API Response Verification

### Check if APIs are working:

Open browser console and run:

```javascript
// Test Community API
fetch('/api/kpi/member-growth?period=monthly')
  .then(r => r.json())
  .then(d => console.log('Member Growth:', d))

// Expected response:
{
  "error": false,
  "data": {
    "summary": { "total": X, "new": Y, "left": Z },
    "trend": [ ... ],
    "breakdown": { ... }
  }
}
```

If you get errors:
- `404`: Endpoint doesn't exist → Check backend routes
- `500`: Server error → Check backend logs
- `CORS error`: Backend CORS not configured
- `Network error`: Backend not running

---

## Data Requirements for Testing

### Minimum Data Needed

To see meaningful results, your database should have:

```
Users/Members: ≥ 10
Completed Orders: ≥ 20
Support Tickets: ≥ 10
Discord Messages: ≥ 50
Workers: ≥ 5
```

### Check Database:

```sql
-- Quick data check
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders WHERE status = 'completed'
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Discord Messages', COUNT(*) FROM discord_messages
UNION ALL
SELECT 'Workers', COUNT(*) FROM users WHERE role = 'worker';
```

If all counts are 0 → Dashboard will show empty states (this is normal).

---

## Screenshot Checklist

Take screenshots of each tab to document:

1. **Overview Tab**
   - [ ] Hero metrics
   - [ ] Quick actions

2. **Community Tab**
   - [ ] Member Growth section
   - [ ] Repeat Customers section
   - [ ] Discord Engagement section

3. **Support Tab**
   - [ ] Support Response Time section
   - [ ] All 4 KPI sections visible

4. **Operations Tab**
   - [ ] All 6 KPI sections visible

5. **Financial Tab**
   - [ ] 4 metric cards
   - [ ] System wallet (if applicable)
   - [ ] Expense breakdown

6. **Mobile View**
   - [ ] Any tab in mobile view

Save screenshots to: `/Users/mohamednasser/Documents/morita/morita_dashboard/screenshots/`

---

## Completion Time

**Estimated Time Breakdown**:
- Setup: 1 min
- Open dashboard: 1 min
- Test each tab: 5 min
- Period selectors: 2 min
- API verification: 1 min
- Mobile view: 1 min
- Final check: 1 min

**Total: ~12 minutes**

---

## Sign-Off

After completing quick start testing:

- **Date**: _______________
- **Tester**: _______________
- **Result**: ⬜ Pass  ⬜ Fail  ⬜ Partial
- **Issues Found**: _______________
- **Ready for Full Testing**: ⬜ Yes  ⬜ No

---

## What's Next?

✅ **Quick test passed** → Proceed to full testing
📋 **Use TESTING_CHECKLIST.md** for comprehensive test
📖 **Read TESTING_GUIDE.md** for detailed instructions
🐛 **Found bugs** → Document and fix before continuing

---

**Good luck with testing! 🚀**
