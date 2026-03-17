# Debug: Cohort Retention Analysis Empty Chart

## Issue
The Cohort Retention Analysis chart is still showing empty even though API returns data.

## API Response
```json
"cohortAnalysis": [
  {
    "cohortMonth": "2026-03",
    "customersAcquired": 1,
    "repeatCustomers": 1,
    "retentionRate": 100
  }
]
```

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. Check what `cohortAnalysis` array contains

### Step 2: Add Console Logging
Open `/src/pages/kpis/tabs/CommunityTab.jsx` and add this after line 145:

```javascript
const cohortAnalysis = repeatCustomers?.cohortAnalysis || []

// DEBUG: Log cohort data
console.log('=== COHORT DEBUG ===')
console.log('repeatCustomers:', repeatCustomers)
console.log('cohortAnalysis:', cohortAnalysis)
console.log('cohortAnalysis.length:', cohortAnalysis.length)
```

### Step 3: Check Chart Data Transformation
The chart transforms data like this:
```javascript
data={cohortAnalysis.map(item => ({
  label: moment(item.cohortMonth).format('MMM YYYY'),
  retention: item.retentionRate
}))}
```

Expected output:
```javascript
[
  {
    label: "Mar 2026",
    retention: 100
  }
]
```

### Step 4: Verify Moment.js Format
The issue might be with `moment(item.cohortMonth).format('MMM YYYY')`

Try in console:
```javascript
import moment from 'moment'
moment("2026-03").format('MMM YYYY')  // Should output: "Mar 2026"
```

## Possible Causes

1. **Moment.js parsing issue**: "2026-03" might not parse correctly
   - Fix: Use `moment(item.cohortMonth, 'YYYY-MM')`

2. **Chart not re-rendering**: Component state might not trigger re-render
   - Fix: Check if `repeatCustomers` state is updating

3. **Conditional rendering**: `{cohortAnalysis.length > 0 && ...}` might be false
   - Fix: Log the length to verify

## Quick Fix to Try

Replace line 572-575 in CommunityTab.jsx:
```javascript
// BEFORE:
data={cohortAnalysis.map(item => ({
  label: moment(item.cohortMonth).format('MMM YYYY'),
  retention: item.retentionRate
}))}

// AFTER:
data={cohortAnalysis.map(item => ({
  label: moment(item.cohortMonth, 'YYYY-MM').format('MMM YYYY'),
  retention: item.retentionRate
}))}
```

## Check If Chart Receives Data

Add this right before the `<LineChart>` component (line 571):
```javascript
{console.log('Chart data:', cohortAnalysis.map(item => ({
  label: moment(item.cohortMonth).format('MMM YYYY'),
  retention: item.retentionRate
})))}
```
