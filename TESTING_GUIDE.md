# KPI Dashboard Testing Guide

This guide explains how to test each tab of the KPI Dashboard and what data dependencies exist in your system.

## Table of Contents
1. [Overview Tab](#overview-tab)
2. [Community Tab](#community-tab)
3. [Support Tab](#support-tab)
4. [Operations Tab](#operations-tab)
5. [Financial Tab](#financial-tab)
6. [Common Testing Steps](#common-testing-steps)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before testing, ensure:
- ✅ Development server is running: `npm run dev` (port 3001)
- ✅ Backend API is running and accessible
- ✅ You have access to the KPI dashboard at `/kpis`

---

## Overview Tab

### What It Shows
Executive summary with hero metrics from all categories:
- Total revenue
- Net profit
- Total members
- Average response time

### Data Dependencies
| Metric | Requires |
|--------|----------|
| Revenue/Profit | Completed orders in the system |
| Members | Users/customers in database |
| Response Time | Support tickets with first response times |

### Testing Steps

1. **Navigate to Overview Tab**
   ```
   URL: http://localhost:3001/kpis?tab=overview
   ```

2. **Check Hero Metrics Load**
   - [ ] Open browser DevTools (F12) → Console tab
   - [ ] Refresh page
   - [ ] Look for API calls to:
     - `/kpi/financial-overview?period=monthly`
     - `/kpi/member-growth?period=monthly`
     - `/kpi/support-response-time?period=monthly`
   - [ ] Verify no error messages in console

3. **Verify Data Display**
   - [ ] Check if metrics show numbers (not "0" or "Loading...")
   - [ ] Click on each metric card
   - [ ] Verify it navigates to correct tab

4. **Test Quick Actions**
   - [ ] Click "View Community Metrics" → Should go to Community tab
   - [ ] Click "View Support Metrics" → Should go to Support tab
   - [ ] Click "View Operations Metrics" → Should go to Operations tab
   - [ ] Click "View Financial Metrics" → Should go to Financial tab

### Expected Behavior
- ✅ If you have data: Metrics show real numbers
- ✅ If no data: Shows "0" or placeholder values
- ✅ Loading state appears briefly
- ❌ Should NOT show errors in console

### Sample Test Data Check
Open browser console and run:
```javascript
// Check if data is loaded
console.log('Hero Metrics:', document.querySelectorAll('[class*="heroCard"]').length);
```
Should return: 4 (four hero metric cards)

---

## Community Tab

### What It Shows
3 KPIs related to community and customers:
1. **Member Growth** - New members, retention, demographics
2. **Repeat Customers** - Purchase frequency, cohort analysis
3. **Discord Engagement** - Messages, reactions, active users

### Data Dependencies

#### KPI #1: Member Growth
| Data | Source | Required Fields |
|------|--------|----------------|
| New members | Database users table | `createdAt`, `status` |
| Member leaves | Leave/kick/ban records | `type`, `reason`, `timestamp` |
| Active members | User activity logs | `lastActive` |

#### KPI #2: Repeat Customers
| Data | Source | Required Fields |
|------|--------|----------------|
| Orders | Orders table | `customerId`, `createdAt`, `status: 'completed'` |
| Customer info | Users table | `id`, `name`, `email` |

#### KPI #3: Discord Engagement
| Data | Source | Required Fields |
|------|--------|----------------|
| Messages | Discord message logs | `userId`, `channelId`, `timestamp` |
| Reactions | Reaction events | `userId`, `type`, `timestamp` |
| User ranks | Discord rank system | `userId`, `rank`, `score` |

### Testing Steps

1. **Navigate to Community Tab**
   ```
   URL: http://localhost:3001/kpis?tab=community
   ```

2. **Test Member Growth KPI**

   a. **Period Selector**
   - [ ] Click "Daily" button → Check data updates
   - [ ] Click "Weekly" button → Check data updates
   - [ ] Click "Monthly" button (default) → Check data updates
   - [ ] Click "Quarterly" button → Check data updates
   - [ ] Click "Yearly" button → Check data updates

   b. **Metric Cards**
   - [ ] Verify 4 metric cards display:
     - Total Members
     - New Members (this period)
     - Members Left
     - Growth Rate (%)

   c. **Growth Trend Chart**
   - [ ] Check line chart appears
   - [ ] Hover over data points → Tooltip shows details
   - [ ] Verify X-axis shows dates/periods
   - [ ] Verify Y-axis shows member counts

   d. **Leave Type Distribution**
   - [ ] Check pie chart or bar chart appears
   - [ ] Verify breakdown by leave types (voluntary, kicked, banned)

   e. **Recent Kicks/Bans Table**
   - [ ] Verify table shows recent moderation actions
   - [ ] Check columns: Username, Type (Kick/Ban), Reason, Date
   - [ ] If no data: Should show "No recent kicks/bans"

3. **Test Repeat Customers KPI**

   a. **Period Selector**
   - [ ] Test all period options (Daily → Yearly)

   b. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Customers
     - Repeat Customers
     - Repeat Rate (%)
     - Average Orders per Customer

   c. **Purchase Frequency Chart**
   - [ ] Check bar chart shows order frequency distribution
   - [ ] Verify bars for: 1 order, 2 orders, 3-5 orders, 6+ orders

   d. **Top Customers Table**
   - [ ] Verify table shows top repeat customers
   - [ ] Check columns: Rank, Customer Name, Total Orders, Total Spent
   - [ ] Verify sorting by order count (descending)

4. **Test Discord Engagement KPI**

   a. **Period Selector**
   - [ ] Test all period options

   b. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Messages
     - Reactions Given
     - Reactions Received
     - Engagement Score

   c. **Engagement Trend Chart**
   - [ ] Check line chart shows engagement over time
   - [ ] Verify multiple lines (messages, reactions)

   d. **Top Contributors Table**
   - [ ] Verify table shows most active Discord users
   - [ ] Check columns: Rank, User, Messages, Reactions Given/Received, Score

   e. **Channel Activity**
   - [ ] Check bar chart shows messages per channel
   - [ ] Verify channel names on X-axis

   f. **Active Ranks Display**
   - [ ] Check grid shows user ranks
   - [ ] Verify rank badges, names, scores, dates

### API Endpoints Called
```
GET /kpi/member-growth?period={daily|weekly|monthly|quarterly|yearly}
GET /kpi/repeat-customers?period={daily|weekly|monthly|quarterly|yearly}
GET /kpi/discord-engagement?period={daily|weekly|monthly|yearly}
```

### How to Verify API Responses

Open DevTools → Network tab:
```
1. Filter by "Fetch/XHR"
2. Refresh the tab
3. Click on each API request
4. Check "Response" tab
5. Verify structure:
   {
     "error": false,
     "data": {
       "summary": { ... },
       "trend": [ ... ],
       "breakdown": { ... }
     }
   }
```

---

## Support Tab

### What It Shows
4 KPIs related to customer support:
1. **Support First Response Time** - How fast team responds to tickets
2. **Ticket to Order Conversion** - Success rate converting tickets to sales
3. **Peak Ticket Times** - When tickets are created most
4. **Support Reply Speed** - Agent performance metrics

### Data Dependencies

#### KPI #1: Support Response Time
| Data | Source | Required Fields |
|------|--------|----------------|
| Tickets | Support tickets table | `id`, `createdAt`, `firstResponseAt`, `status` |
| Response times | Calculated field | `firstResponseAt - createdAt` |
| Agents | Support team users | `id`, `name`, `role: 'support'` |

#### KPI #2: Ticket Conversion
| Data | Source | Required Fields |
|------|--------|----------------|
| Tickets | Tickets table | `id`, `status`, `convertedToOrder` |
| Orders | Orders linked to tickets | `ticketId`, `status: 'completed'` |

#### KPI #3: Peak Ticket Times
| Data | Source | Required Fields |
|------|--------|----------------|
| Tickets | Tickets table | `createdAt` (for hour/day analysis) |

#### KPI #4: Reply Speed
| Data | Source | Required Fields |
|------|--------|----------------|
| Ticket replies | Ticket messages/replies | `ticketId`, `agentId`, `timestamp` |
| Agent performance | Calculated metrics | Average reply time per agent |

### Testing Steps

1. **Navigate to Support Tab**
   ```
   URL: http://localhost:3001/kpis?tab=support
   ```

2. **Test Support Response Time KPI**

   a. **SLA Target Control**
   - [ ] Check input field shows default: 15 minutes
   - [ ] Change to 10 minutes → Verify SLA compliance recalculates
   - [ ] Change to 30 minutes → Verify SLA compliance recalculates

   b. **Period Selector**
   - [ ] Test all period options

   c. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Average Response Time (in minutes)
     - Median Response Time
     - SLA Compliance (%)
     - Tickets Responded

   d. **Response Time Trend Chart**
   - [ ] Check line chart shows response times over time
   - [ ] Verify SLA target line (horizontal reference line)
   - [ ] Hover over points → See exact times

   e. **Agent Performance Table**
   - [ ] Verify table shows all support agents
   - [ ] Check columns: Agent Name, Discord Tag, Tickets Handled, Avg Response, SLA Rate
   - [ ] Check color coding:
     - 🟢 Excellent (≥95% SLA)
     - 🟡 Good (80-94% SLA)
     - 🔴 Needs Improvement (<80% SLA)

   f. **Unanswered Tickets Alert**
   - [ ] If unanswered tickets exist: Alert card appears
   - [ ] Check table shows: Ticket #, Type, Time Elapsed
   - [ ] Verify time elapsed is accurate

3. **Test Ticket Conversion KPI**

   a. **Period Selector**
   - [ ] Test all periods

   b. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Tickets
     - Converted to Orders
     - Conversion Rate (%)
     - Average Conversion Time

   c. **Conversion Funnel Chart**
   - [ ] Check funnel/bar chart shows:
     - Tickets Created
     - Tickets Responded
     - Tickets Converted

   d. **Conversion Time Distribution**
   - [ ] Check bar chart shows time buckets
   - [ ] Verify buckets: <1h, 1-6h, 6-24h, 24h+

4. **Test Peak Ticket Times KPI**

   a. **Period Selector**
   - [ ] Weekly (default) → Shows hourly peaks
   - [ ] Monthly → Shows daily peaks
   - [ ] Yearly → Shows monthly peaks

   b. **Peak Times Chart**
   - [ ] Check bar/heatmap chart
   - [ ] Verify X-axis: Time periods
   - [ ] Verify Y-axis: Ticket count

   c. **Peak Hours/Days List**
   - [ ] Check list shows top 5 peak periods
   - [ ] Format: "Monday 2PM - 18 tickets"

5. **Test Support Reply Speed KPI**

   a. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Average Reply Time
     - Fastest Agent
     - Slowest Agent
     - Total Replies

   b. **Agent Leaderboard**
   - [ ] Check table sorted by reply speed (fastest first)
   - [ ] Verify columns: Rank, Agent, Avg Reply Time, Total Replies
   - [ ] Check visual indicators for top performers

### API Endpoints Called
```
GET /kpi/support-response-time?period={period}&slaTarget={minutes}
GET /kpi/ticket-conversion?period={period}
GET /kpi/peak-ticket-times?period={period}
GET /kpi/support-reply-speed?period={period}
```

### Testing with Real Scenarios

**Scenario 1: High Response Time**
```
Expected: SLA compliance < 80% → Cards show red
Test: Create tickets but don't respond quickly
```

**Scenario 2: No Unanswered Tickets**
```
Expected: No alert card appears
Test: Ensure all tickets have first response
```

**Scenario 3: Period Changes**
```
1. Select "Daily" → Should show today's data
2. Select "Monthly" → Should show last 30 days
3. Verify data aggregation changes accordingly
```

---

## Operations Tab

### What It Shows
6 KPIs related to operations and workers:
1. **Order Issues & Reports** - Problems with orders
2. **Order Completion Time** - How long orders take
3. **Service Request Measurement** - Service usage metrics
4. **Service Request Conversion** - Quote → Order conversion
5. **Worker Performance Metrics** - Worker productivity
6. **Worker Issue Tracking** - Worker-related problems

### Data Dependencies

#### KPI #1: Order Issues
| Data | Source | Required Fields |
|------|--------|----------------|
| Issues | Order issues table | `orderId`, `type`, `severity`, `status`, `createdAt` |
| Orders | Orders table | `id`, `serviceName`, `status` |

#### KPI #2: Order Completion Time
| Data | Source | Required Fields |
|------|--------|----------------|
| Orders | Orders table | `createdAt`, `completedAt`, `status: 'completed'` |
| Completion time | Calculated | `completedAt - createdAt` |

#### KPI #3: Service Requests
| Data | Source | Required Fields |
|------|--------|----------------|
| Requests | Service requests table | `serviceType`, `status`, `createdAt` |

#### KPI #4: Service Conversion
| Data | Source | Required Fields |
|------|--------|----------------|
| Quotes | Service quotes table | `id`, `createdAt`, `status` |
| Orders | Orders from quotes | `quoteId`, `status: 'completed'` |
| Revenue | Order value | `totalAmount` |

#### KPI #5: Worker Performance
| Data | Source | Required Fields |
|------|--------|----------------|
| Workers | Workers table | `id`, `name`, `discordTag` |
| Orders | Worker assignments | `workerId`, `orderId`, `completedAt` |
| Ratings | Customer ratings | `workerId`, `rating`, `orderId` |

#### KPI #6: Worker Issues
| Data | Source | Required Fields |
|------|--------|----------------|
| Issues | Worker issues table | `workerId`, `type`, `severity`, `createdAt` |

### Testing Steps

1. **Navigate to Operations Tab**
   ```
   URL: http://localhost:3001/kpis?tab=operations
   ```

2. **Test Order Issues KPI**

   a. **Period Selector**
   - [ ] Test all periods

   b. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Issues
     - Critical Issues
     - Resolved Issues
     - Resolution Rate (%)

   c. **Issue Breakdown Chart**
   - [ ] Check pie chart by issue type
   - [ ] Verify categories: Payment, Quality, Delivery, Technical, Other

   d. **Recent Issues Table**
   - [ ] Check table shows latest issues
   - [ ] Columns: Order ID, Service, Issue Type, Status, Priority, Date
   - [ ] Verify status badges (Open, In Progress, Resolved)
   - [ ] Verify priority badges (Low, Medium, High, Critical)

3. **Test Order Completion Time KPI**

   a. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Average Completion Time
     - Median Time
     - Fastest Completion
     - Slowest Completion

   b. **Completion Time Trend**
   - [ ] Check line chart shows average time over periods
   - [ ] Verify trend line

   c. **Time Distribution**
   - [ ] Check bar chart with time buckets
   - [ ] Buckets: <1h, 1-6h, 6-24h, 1-3d, 3d+

4. **Test Service Requests KPI**

   a. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Requests
     - Completed Requests
     - Pending Requests
     - Completion Rate (%)

   b. **Request by Service Type**
   - [ ] Check bar chart by service category
   - [ ] Verify all service types appear

5. **Test Service Conversion KPI**

   a. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Quotes
     - Converted to Orders
     - Conversion Rate (%)
     - Total Revenue from Conversions

   b. **Conversion Funnel**
   - [ ] Check funnel shows: Quotes → Orders → Completed

   c. **Top Converting Services**
   - [ ] Check table shows services with highest conversion rates

6. **Test Worker Performance KPI**

   a. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Active Workers
     - Average Rating
     - Total Orders Completed
     - Average Orders per Worker

   b. **Worker Leaderboard**
   - [ ] Check table shows all workers
   - [ ] Columns: Rank, Worker Name, Discord Tag, Orders, Avg Rating, Total Earned
   - [ ] Verify sorted by performance score

   c. **Rating Distribution**
   - [ ] Check bar chart shows rating breakdown (1-5 stars)

7. **Test Worker Issues KPI**

   a. **Metric Cards**
   - [ ] Verify 4 metrics:
     - Total Issues
     - Critical Issues
     - Resolved Issues
     - Resolution Rate (%)

   b. **Issue Type Breakdown**
   - [ ] Check pie chart by issue category

   c. **Recent Issues Table**
   - [ ] Check table shows latest worker issues
   - [ ] Columns: Worker, Issue Type, Severity, Status, Date

### API Endpoints Called
```
GET /kpi/order-issues?period={period}
GET /kpi/order-completion-time?period={period}
GET /kpi/service-requests?period={period}
GET /kpi/service-conversion?period={period}
GET /kpi/worker-performance?period={period}
GET /kpi/worker-issues?period={period}
```

### Testing Worker-Related Features

**Test Scenario: Top Performer Worker**
```
1. Find worker with highest rating
2. Verify they appear at top of leaderboard
3. Check their stats are accurate:
   - Order count matches database
   - Average rating is correct
   - Earnings calculation: (orders * 80% of order value)
```

**Test Scenario: Worker with Issues**
```
1. Worker with logged issues
2. Verify appears in worker issues table
3. Check issue severity color coding
4. Verify issue count is accurate
```

---

## Financial Tab

### What It Shows
1 comprehensive KPI covering all financial metrics:
- Revenue breakdown
- Expense tracking
- Profit analysis
- System wallet balance

### Data Dependencies

| Data | Source | Required Fields |
|------|--------|----------------|
| Revenue | Completed orders | `totalAmount`, `status: 'completed'`, `completedAt` |
| Worker payouts | Order payments | 80% of order value |
| Support payouts | Order payments | 5% of order value |
| System cut | Calculated | 15% of order value (gross profit) |
| Operational expenses | Expenses table | `amount`, `category`, `createdAt` |
| System wallet | Wallet table | `balance`, `currency` |

### Financial Calculations
```
Total Revenue = Sum of all completed order amounts
Gross Profit = Total Revenue × 15%
Worker Payouts = Total Revenue × 80%
Support Payouts = Total Revenue × 5%
Operational Expenses = Sum of expense records
Total Expenses = Worker Payouts + Support Payouts + Operational Expenses
Net Profit = Gross Profit - Operational Expenses
Net Profit Margin = (Net Profit / Total Revenue) × 100
```

### Testing Steps

1. **Navigate to Financial Tab**
   ```
   URL: http://localhost:3001/kpis?tab=financial
   ```

2. **Test Period Selector**
   - [ ] Click "Daily" → Should show today's financials
   - [ ] Click "Weekly" → Last 7 days
   - [ ] Click "Monthly" (default) → Last 30 days
   - [ ] Click "Quarterly" → Last 3 months
   - [ ] Click "Yearly" → Last 12 months
   - [ ] Verify data updates on each change

3. **Test Metric Cards**

   a. **Total Revenue Card (Blue)**
   - [ ] Shows dollar amount formatted with 2 decimals
   - [ ] Shows total order count
   - [ ] Shows average order value
   - [ ] Icon: Cash/dollar sign

   b. **Gross Profit Card (Green)**
   - [ ] Shows 15% of total revenue
   - [ ] Shows gross profit margin percentage
   - [ ] Calculation: Should equal Total Revenue × 0.15

   c. **Total Expenses Card (Red)**
   - [ ] Shows sum of all expenses
   - [ ] Shows breakdown: Workers + OpEx
   - [ ] Verify worker payout = Revenue × 0.80

   d. **Net Profit Card (Green or Red)**
   - [ ] Color changes based on value:
     - Green if profit ≥ 0
     - Red if profit < 0 (loss)
   - [ ] Shows net profit margin percentage
   - [ ] Calculation: Gross Profit - Operational Expenses

4. **Test System Wallet**
   - [ ] Green card appears if wallet data exists
   - [ ] Shows current balance with 2 decimal places
   - [ ] Shows currency (USD, etc.)
   - [ ] Format: "$X,XXX.XX USD"

5. **Test Expense Breakdown Section**
   - [ ] Card titled "💸 Expense Breakdown" appears
   - [ ] Shows 4 rows:
     1. Worker Payouts (80%)
     2. Support Team Payouts (5%)
     3. Operational Expenses
     4. **Total Expenses** (highlighted row)
   - [ ] Total row has blue border and bold text
   - [ ] Verify sum: Row 1 + Row 2 + Row 3 = Row 4

6. **Test No Data States**

   a. **If Total Revenue = 0:**
   - [ ] Shows large message: "💰 No revenue data for this period"
   - [ ] Shows subtext: "Financial data will appear once orders are completed."

   b. **If No Financial Data at All:**
   - [ ] Shows: "No financial data available"

7. **Test Loading State**
   - [ ] Refresh page
   - [ ] Should briefly show: "Loading financial data..."
   - [ ] Then switches to actual data

8. **Test Financial Insights Card**
   - [ ] Card appears at bottom
   - [ ] Title: "💡 Financial Insights"
   - [ ] Shows 5 bullet points explaining metrics
   - [ ] All text is readable and properly formatted

### API Endpoint Called
```
GET /kpi/financial-overview?period={daily|weekly|monthly|quarterly|yearly}
```

### Expected Response Structure
```json
{
  "error": false,
  "data": {
    "summary": {
      "totalRevenue": 125450.00,
      "totalOrders": 450,
      "avgOrderValue": 278.78,
      "grossProfit": 18817.50,
      "grossProfitMargin": 15,
      "totalExpenses": 106385.00,
      "netProfit": 12432.50,
      "netProfitMargin": 9.91
    },
    "expenses": {
      "workerPayouts": 100360.00,
      "supportPayouts": 6272.50,
      "operational": 15000.00
    },
    "systemWallet": {
      "balance": 45230.75,
      "currency": "USD"
    }
  }
}
```

### Manual Calculations to Verify

**Example with $10,000 Total Revenue:**
```
Total Revenue:        $10,000.00
-------------------------------------
Gross Profit (15%):   $1,500.00
Worker Payouts (80%): $8,000.00
Support Payouts (5%): $500.00
Operational Expenses: $300.00 (from expense records)
-------------------------------------
Total Expenses:       $8,800.00
Net Profit:           $700.00 ($1,500 - $800)
Net Margin:           7% ($700 / $10,000)
```

### Verification Queries

Run in browser console after data loads:
```javascript
// Get all metric values
const metrics = Array.from(document.querySelectorAll('[class*="metricValue"]'))
  .map(el => el.textContent);
console.log('Metrics:', metrics);

// Expected: ['$XX,XXX.XX', '$X,XXX.XX', '$XX,XXX.XX', '$X,XXX.XX']
```

---

## Common Testing Steps

### 1. Browser Compatibility Testing
Test on multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

### 2. Responsive Design Testing

**Desktop (1920x1080):**
- [ ] All metric cards show in grid (4 columns)
- [ ] Charts are wide and readable
- [ ] Tables show all columns

**Tablet (768x1024):**
- [ ] Metric cards adapt to 2 columns
- [ ] Charts scale properly
- [ ] Tables scrollable horizontally

**Mobile (375x667):**
- [ ] Navigate to: http://localhost:3001/kpis
- [ ] Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select "iPhone SE" or similar
- [ ] Test each tab:
  - [ ] Metric cards stack vertically (1 column)
  - [ ] Period selector buttons show only icons
  - [ ] Tables scroll horizontally
  - [ ] Tab navigation shows only icons
  - [ ] All content is readable without zooming

### 3. Performance Testing

**Check Page Load Times:**
```javascript
// Run in console
performance.getEntriesByType('navigation')[0].loadEventEnd
// Should be < 3000ms (3 seconds)
```

**Check API Response Times:**
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Refresh page
4. Check each API call time
5. Should be < 2000ms per request

### 4. Error Handling Testing

**Test Scenario: API Unavailable**
```
1. Stop backend server
2. Refresh KPI dashboard
3. Expected:
   - Error notification appears
   - Shows "Failed to load [KPI name] data"
   - No console errors crash the app
   - Empty state displays (not loading forever)
```

**Test Scenario: Invalid Period**
```
1. Manually change URL: ?tab=community&period=invalid
2. Expected:
   - Defaults to 'monthly'
   - No errors thrown
```

**Test Scenario: Missing Data Fields**
```
API returns incomplete data:
{
  "error": false,
  "data": {
    "summary": {}  // Empty summary
  }
}

Expected:
- Shows "0" or "N/A" for missing values
- No "undefined" or "null" displayed
- No JavaScript errors
```

### 5. Navigation Testing

**Tab Switching:**
- [ ] Click Overview tab → URL shows `?tab=overview`
- [ ] Click Community tab → URL shows `?tab=community`
- [ ] Click Support tab → URL shows `?tab=support`
- [ ] Click Operations tab → URL shows `?tab=operations`
- [ ] Click Financial tab → URL shows `?tab=financial`
- [ ] Press browser Back button → Previous tab loads
- [ ] Press browser Forward button → Next tab loads
- [ ] Copy URL, open in new tab → Correct tab loads

**Deep Linking:**
```
Direct URLs should work:
http://localhost:3001/kpis?tab=community
http://localhost:3001/kpis?tab=support
http://localhost:3001/kpis?tab=operations
http://localhost:3001/kpis?tab=financial
```

### 6. Data Refresh Testing

**Auto-refresh Test:**
- [ ] Stay on a tab for 5 minutes
- [ ] Check if data auto-refreshes (if implemented)
- [ ] Or manually refresh browser
- [ ] New data should load

**Period Change Refresh:**
- [ ] Select "Monthly"
- [ ] Note a metric value
- [ ] Select "Yearly"
- [ ] Metric value should change (if data differs)
- [ ] Select "Monthly" again
- [ ] Original value should return

### 7. Visual Regression Testing

**Check Styling:**
- [ ] All tabs have consistent styling
- [ ] Period selector buttons styled correctly
- [ ] Metric cards have proper spacing
- [ ] Charts have legends and labels
- [ ] Tables have headers and proper alignment
- [ ] Colors match design tokens:
  - Blue: #3b82f6 (Info)
  - Green: #10b981 (Success)
  - Red: #ef4444 (Danger)
  - Orange: #f97316 (Warning)

---

## Troubleshooting

### Problem: "No data available" on all tabs

**Possible Causes:**
1. Backend API not running
2. Database is empty
3. API endpoint mismatch

**Solutions:**
```bash
# Check backend is running
curl http://localhost:YOUR_BACKEND_PORT/api/kpi/member-growth?period=monthly

# Check database has data
# Run SQL query:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders WHERE status = 'completed';
SELECT COUNT(*) FROM tickets;
```

### Problem: Charts not displaying

**Possible Causes:**
1. Chart library not loaded
2. Data format incorrect
3. Container size issues

**Solutions:**
```javascript
// Check if Recharts is loaded (run in console)
console.log(window.Recharts);

// Check container has height
document.querySelector('[class*="chartContainer"]').offsetHeight
// Should be > 0
```

### Problem: Period selector buttons not styled

**Possible Causes:**
1. CSS Modules not working
2. `:global()` wrapper missing
3. Build cache issue

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check if CSS file is loaded
# DevTools → Sources → Look for SupportTab.module.scss
```

### Problem: API errors in console

**Example Error:**
```
Error: Network request failed
```

**Debugging Steps:**
1. Open DevTools → Network tab
2. Find failing request
3. Check:
   - Status code (should be 200)
   - Response tab (check error message)
   - Headers tab (check CORS)
4. Verify API endpoint in `/src/controllers/kpi.js`

### Problem: Metrics show "0" but data exists

**Possible Causes:**
1. Date range filter too narrow
2. Status filter excluding data
3. Data aggregation issue

**Solutions:**
1. Try "Yearly" period (widest range)
2. Check API response in Network tab:
   ```json
   {
     "error": false,
     "data": {
       "summary": {
         "total": 0  // ← Issue here
       }
     }
   }
   ```
3. Check backend KPI calculation logic

### Problem: Slow performance

**Symptoms:**
- Page takes >5 seconds to load
- UI freezes when switching tabs
- Charts lag when rendering

**Solutions:**
1. Check API response times (should be <2s)
2. Reduce data points in charts (limit to 30 days for daily data)
3. Add pagination to tables (show 10-20 rows max)
4. Implement lazy loading for charts

---

## Testing Checklist Summary

### Quick Test (5 minutes)
- [ ] Navigate to `/kpis`
- [ ] Click each tab once
- [ ] Verify no errors in console
- [ ] Check at least one metric card per tab

### Standard Test (15 minutes)
- [ ] Test all 5 tabs
- [ ] Test period selectors on 2-3 KPIs
- [ ] Check 1 chart and 1 table per tab
- [ ] Test mobile view
- [ ] Verify API calls in Network tab

### Comprehensive Test (45 minutes)
- [ ] Follow all testing steps above
- [ ] Test all period options on all KPIs
- [ ] Verify all calculations manually
- [ ] Test error scenarios
- [ ] Test on 3 browsers
- [ ] Test on 3 screen sizes
- [ ] Document any bugs found

---

## Data Population for Testing

### Minimum Required Data

To test all features, ensure you have:

```sql
-- At least 30 users
SELECT COUNT(*) FROM users; -- Should be ≥ 30

-- At least 50 completed orders
SELECT COUNT(*) FROM orders WHERE status = 'completed'; -- Should be ≥ 50

-- At least 20 support tickets
SELECT COUNT(*) FROM tickets; -- Should be ≥ 20

-- At least 10 workers
SELECT COUNT(*) FROM users WHERE role = 'worker'; -- Should be ≥ 10

-- At least 5 order issues
SELECT COUNT(*) FROM order_issues; -- Should be ≥ 5

-- Discord engagement data
SELECT COUNT(*) FROM discord_messages; -- Should be ≥ 100
```

### Test Data Scenarios

**Scenario 1: New Platform (No Data)**
- All tabs show empty states
- Metric values are 0
- Charts show "No data"
- This is valid behavior

**Scenario 2: Active Platform (Rich Data)**
- All metrics show real numbers
- Charts display trends
- Tables show recent records
- This is ideal for testing

**Scenario 3: Edge Cases**
- Very high values (millions)
- Very low values (decimals)
- Exactly 0 values
- Negative values (net loss)

---

## Reporting Issues

When reporting bugs, include:

1. **Tab Name**: Which tab (Overview, Community, Support, Operations, Financial)
2. **KPI Name**: Specific KPI section
3. **Period Selected**: Daily, Weekly, Monthly, etc.
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happened
6. **Console Errors**: Copy from DevTools Console
7. **Network Errors**: Screenshot from DevTools Network tab
8. **Screenshot**: Visual proof of the issue
9. **Steps to Reproduce**: How to recreate the bug

**Example Issue Report:**
```
Tab: Support
KPI: Support First Response Time
Period: Monthly
Expected: Shows average response time in minutes
Actual: Shows "NaN minutes"
Console Error: TypeError: Cannot read property 'avgResponseMinutes' of undefined
Screenshot: [attach]
Steps:
1. Navigate to Support tab
2. Ensure SLA target is 15 minutes
3. Select Monthly period
4. Error appears in Avg Response Time card
```

---

## Contact & Support

If you encounter issues during testing:
1. Check this guide's Troubleshooting section
2. Review browser console for errors
3. Check API responses in Network tab
4. Verify backend logs
5. Document the issue with screenshots

---

**Last Updated**: 2026-03-16
**Dashboard Version**: 2.0 (Tab-based Redesign)
**Total KPIs**: 14 across 5 tabs
