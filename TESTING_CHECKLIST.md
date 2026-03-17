# KPI Dashboard Testing Checklist

Quick reference for testing all tabs. Check off items as you test.

## Pre-Testing Setup
- [ ] Development server running: `npm run dev`
- [ ] Backend API accessible
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible (no errors)

---

## Overview Tab
**URL**: `http://localhost:3001/kpis?tab=overview`

- [ ] 4 hero metric cards display
- [ ] Revenue/Profit shows numbers
- [ ] Members count shows
- [ ] Response time shows
- [ ] Click each card → Navigates to correct tab
- [ ] 4 quick action buttons work
- [ ] No console errors

---

## Community Tab
**URL**: `http://localhost:3001/kpis?tab=community`

### Member Growth KPI
- [ ] Period selector (5 buttons) works
- [ ] 4 metric cards show data
- [ ] Growth trend chart displays
- [ ] Leave type chart displays
- [ ] Recent kicks/bans table shows

### Repeat Customers KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Purchase frequency chart displays
- [ ] Top customers table shows
- [ ] Cohort analysis displays

### Discord Engagement KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Engagement trend chart displays
- [ ] Top contributors table shows
- [ ] Channel activity chart displays
- [ ] Active ranks grid displays

---

## Support Tab
**URL**: `http://localhost:3001/kpis?tab=support`

### Support Response Time KPI
- [ ] SLA target input works (default: 15)
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Response time trend chart displays
- [ ] Agent performance table shows
- [ ] Unanswered tickets alert (if applicable)

### Ticket Conversion KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Conversion funnel chart displays
- [ ] Conversion time distribution shows

### Peak Ticket Times KPI
- [ ] Period selector works
- [ ] Peak times chart displays
- [ ] Peak hours/days list shows

### Reply Speed KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Agent leaderboard table shows

---

## Operations Tab
**URL**: `http://localhost:3001/kpis?tab=operations`

### Order Issues KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Issue breakdown chart displays
- [ ] Recent issues table shows

### Order Completion Time KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Completion time trend displays
- [ ] Time distribution chart shows

### Service Requests KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Request by service type chart displays

### Service Conversion KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Conversion funnel displays
- [ ] Top converting services table shows

### Worker Performance KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Worker leaderboard table shows
- [ ] Rating distribution chart displays

### Worker Issues KPI
- [ ] Period selector works
- [ ] 4 metric cards show data
- [ ] Issue type breakdown displays
- [ ] Recent issues table shows

---

## Financial Tab
**URL**: `http://localhost:3001/kpis?tab=financial`

### Financial Overview KPI
- [ ] Period selector (5 buttons) works
- [ ] Total Revenue card shows (blue)
- [ ] Gross Profit card shows (green)
- [ ] Total Expenses card shows (red)
- [ ] Net Profit card shows (green/red based on value)
- [ ] System wallet balance displays
- [ ] Expense breakdown section shows:
  - [ ] Worker Payouts (80%)
  - [ ] Support Payouts (5%)
  - [ ] Operational Expenses
  - [ ] Total Expenses (bold row)
- [ ] Financial insights card displays
- [ ] If no data: Shows empty state message

---

## Cross-Tab Testing

### Navigation
- [ ] Click each tab → URL updates correctly
- [ ] Browser back button → Returns to previous tab
- [ ] Browser forward button → Goes to next tab
- [ ] Direct URL with ?tab=X → Loads correct tab
- [ ] Tab stays active after page refresh

### Period Selectors
Test on at least 3 KPIs:
- [ ] Daily → Data updates
- [ ] Weekly → Data updates
- [ ] Monthly → Data updates
- [ ] Quarterly → Data updates (where available)
- [ ] Yearly → Data updates

---

## Responsive Testing

### Mobile (375x667)
- [ ] Open DevTools → Device toolbar (Ctrl+Shift+M)
- [ ] Select "iPhone SE"
- [ ] Test each tab:
  - [ ] Metric cards stack vertically
  - [ ] Period buttons show (may be smaller)
  - [ ] Tables scroll horizontally
  - [ ] Charts are readable
  - [ ] No horizontal page scroll

### Tablet (768x1024)
- [ ] Select "iPad"
- [ ] Metric cards show 2 columns
- [ ] All content readable
- [ ] Charts scale properly

### Desktop (1920x1080)
- [ ] Metric cards show 4 columns
- [ ] Full layout displays correctly
- [ ] No overflow issues

---

## Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (Mac only)

---

## Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API calls complete < 2 seconds each
- [ ] No memory leaks (check Task Manager after 5 min)
- [ ] Smooth scrolling
- [ ] Charts render without lag

---

## Error Handling

### Test: Backend Offline
1. [ ] Stop backend server
2. [ ] Refresh page
3. [ ] Expected: Error notification appears
4. [ ] Shows "Failed to load..." message
5. [ ] No infinite loading state

### Test: Empty Data
1. [ ] Select period with no data
2. [ ] Expected: Shows "No data" or 0 values
3. [ ] No "undefined" or "null" text
4. [ ] No console errors

### Test: Invalid URL
1. [ ] Navigate to `/kpis?tab=invalid`
2. [ ] Expected: Defaults to Overview tab
3. [ ] No errors thrown

---

## Console Checks (DevTools)

### Network Tab
- [ ] Filter: Fetch/XHR
- [ ] All API calls show status 200
- [ ] Response times < 2000ms
- [ ] Response format is valid JSON

### Console Tab
- [ ] No red errors
- [ ] No yellow warnings (or only expected ones)
- [ ] No failed resource loads

---

## Data Verification

### Run in Browser Console:
```javascript
// Check metric cards count per tab
document.querySelectorAll('[class*="metricCard"]').length
// Should return 4 or more

// Check if charts exist
document.querySelectorAll('svg').length > 0
// Should return true if charts loaded

// Check if tables exist
document.querySelectorAll('table').length
// Should return ≥ 1 if tables exist on tab
```

---

## Visual QA

### Styling
- [ ] Period selector buttons have proper styling
- [ ] Active button highlighted (blue)
- [ ] Metric cards have icons and proper spacing
- [ ] Charts have titles and legends
- [ ] Tables have headers
- [ ] Colors match:
  - Blue: #3b82f6
  - Green: #10b981
  - Red: #ef4444
  - Orange: #f97316

### Typography
- [ ] All text readable
- [ ] No overlapping text
- [ ] Proper font sizes
- [ ] Consistent spacing

### Layout
- [ ] No broken grids
- [ ] Cards aligned properly
- [ ] Spacing consistent
- [ ] No overflow/cutoff content

---

## Critical Path Test (Quick 5-min test)

1. [ ] Open `/kpis`
2. [ ] Click Community tab
3. [ ] Change period to "Weekly"
4. [ ] Verify data updates
5. [ ] Click Support tab
6. [ ] Change SLA target to 10
7. [ ] Verify SLA compliance recalculates
8. [ ] Click Operations tab
9. [ ] Scroll through all 6 KPIs
10. [ ] Click Financial tab
11. [ ] Change period to "Yearly"
12. [ ] Verify revenue shows
13. [ ] Check console: No errors
14. [ ] **PASS** if all steps work

---

## Sign-Off

### Tester Information
- **Tested By**: _______________
- **Date**: _______________
- **Browser**: _______________
- **Screen Size**: _______________

### Results
- **Total Items**: _____
- **Passed**: _____
- **Failed**: _____
- **Pass Rate**: _____%

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Status
- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ PASS WITH ISSUES - Minor bugs, can deploy
- [ ] ❌ FAIL - Critical issues, do not deploy

---

## Next Steps After Testing

If all tests pass:
1. Commit changes to git
2. Create pull request
3. Deploy to staging environment
4. Perform smoke test on staging
5. Deploy to production

If tests fail:
1. Document all issues in TESTING_GUIDE.md format
2. Prioritize: Critical → High → Medium → Low
3. Fix critical issues first
4. Re-test after fixes
5. Repeat until all tests pass

---

**Testing Guide**: See `TESTING_GUIDE.md` for detailed instructions
**Last Updated**: 2026-03-16
