# KPI Business Testing Guide
## Complete Testing Manual for All 14 KPIs

**Purpose**: This guide explains what each KPI does, how to test it with real actions in Discord/system, and how to verify results are correct.

**Audience**: Business users, QA testers, product managers

---

## Table of Contents
1. [KPI #1: Member Growth & Retention](#kpi-1-member-growth--retention)
2. [KPI #2: Repeat Customer Analysis](#kpi-2-repeat-customer-analysis)
3. [KPI #3: Discord Engagement](#kpi-3-discord-engagement)
4. [KPI #4: Support First Response Time](#kpi-4-support-first-response-time)
5. [KPI #5: Ticket to Order Conversion](#kpi-5-ticket-to-order-conversion)
6. [KPI #6: Peak Ticket Times](#kpi-6-peak-ticket-times)
7. [KPI #7: Support Reply Speed](#kpi-7-support-reply-speed)
8. [KPI #8: Order Issues & Reports](#kpi-8-order-issues--reports)
9. [KPI #9: Order Completion Time](#kpi-9-order-completion-time)
10. [KPI #10: Service Request Measurement](#kpi-10-service-request-measurement)
11. [KPI #11: Service Request Conversion](#kpi-11-service-request-conversion)
12. [KPI #12: Worker Performance](#kpi-12-worker-performance)
13. [KPI #13: Worker Issues](#kpi-13-worker-issues)
14. [KPI #14: Financial Overview](#kpi-14-financial-overview)

---

# Community KPIs (3 KPIs)

## KPI #1: Member Growth & Retention

### What It Does
Tracks how many members join your Discord/platform, how many leave, and why they leave (voluntary, kicked, or banned).

### Business Questions It Answers
- How fast is our community growing?
- Are we retaining members or losing them?
- Why are people leaving?
- What percentage of leaves are voluntary vs. moderation actions?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| New members | Discord join events | User "John" joined on Jan 15, 2026 |
| Member leaves | Discord leave events | User "Jane" left on Jan 20, 2026 |
| Kicks | Moderator kick actions | Moderator kicked "Spammer123" for spam |
| Bans | Moderator ban actions | Moderator banned "BadUser" for harassment |
| Total members | Current Discord member count | 1,523 members |

### How to Test It

#### Test Scenario 1: New Member Join
**Actions in Discord:**
1. Invite 3 new users to Discord server
2. Have them accept invite and join
3. Note the exact date/time they joined

**Expected Results:**
- Dashboard "New Members" count increases by +3
- "Total Members" increases by +3
- Growth trend chart shows spike on join date
- Growth rate percentage increases

**How to Verify:**
```
Before: Total Members = 100, New Members (this month) = 5
Action: Add 3 new members
After: Total Members = 103, New Members (this month) = 8
Calculation: 8 - 5 = 3 ✅ Correct
```

#### Test Scenario 2: Member Leaves Voluntarily
**Actions in Discord:**
1. Have a test user leave the server (not kicked/banned)
2. Note the time they left

**Expected Results:**
- "Members Left" count increases by +1
- "Total Members" decreases by -1
- Leave type breakdown shows +1 "Voluntary Leave"
- Growth rate decreases

**How to Verify:**
```
Before: Members Left = 10
Action: 1 user leaves
After: Members Left = 11
Leave Type: Voluntary = +1 ✅ Correct
```

#### Test Scenario 3: Kick a Member
**Actions in Discord:**
1. As moderator, kick a test user
2. Add reason: "Testing kick functionality"
3. Note the time

**Expected Results:**
- "Members Left" increases by +1
- Leave type shows "Kicked"
- Recent kicks/bans table shows new entry:
  - Username
  - Type: Kick
  - Reason: "Testing kick functionality"
  - Date: Today

**How to Verify:**
```
Before: Kicks (this month) = 2
Action: Kick 1 user
After: Kicks (this month) = 3
Recent table: Shows kicked user with correct reason ✅ Correct
```

#### Test Scenario 4: Ban a Member
**Actions in Discord:**
1. As moderator, ban a test user
2. Add reason: "Spam/harassment"
3. Note the time

**Expected Results:**
- "Members Left" increases by +1
- Leave type shows "Banned"
- Recent kicks/bans table shows new entry:
  - Username
  - Type: Ban (shown in red)
  - Reason: "Spam/harassment"
  - Date: Today

### Common Bugs to Check
- [ ] **Bug**: New joins not counted → Check Discord bot has proper permissions
- [ ] **Bug**: Leaves counted as kicks → Check event type detection
- [ ] **Bug**: Growth rate negative when should be positive → Check calculation formula
- [ ] **Bug**: Recent table doesn't show today's actions → Check date filtering

### Manual Calculation to Verify
```
Growth Rate Formula:
= ((New Members - Members Left) / Previous Total Members) × 100

Example:
Previous Total: 100
New Members: 15
Members Left: 5
Growth = ((15 - 5) / 100) × 100 = 10% ✅

Dashboard should show: +10%
```

---

## KPI #2: Repeat Customer Analysis

### What It Does
Identifies customers who place multiple orders and tracks their buying patterns.

### Business Questions It Answers
- How many customers come back for more orders?
- What's our repeat customer rate?
- Who are our most loyal customers?
- How often do customers reorder?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Customer orders | Orders database | Customer "Alice" has 3 completed orders |
| Order dates | Order timestamps | Order 1: Jan 1, Order 2: Jan 15, Order 3: Feb 1 |
| Order amounts | Order totals | $50, $75, $100 |
| Customer info | User profiles | Name, Discord ID, email |

### How to Test It

#### Test Scenario 1: First-Time Customer
**Actions in System:**
1. Create new customer "TestUser1"
2. Create 1 completed order for them
3. Order amount: $50
4. Mark order as completed

**Expected Results:**
- "Total Customers" increases by +1
- "Repeat Customers" stays the same (they only have 1 order)
- "Repeat Rate" might decrease slightly
- Purchase frequency chart shows +1 in "1 order" category

**How to Verify:**
```
Before: Total Customers = 100, Repeat = 30 (30%)
Action: Add 1 new customer with 1 order
After: Total Customers = 101, Repeat = 30 (29.7%)
Calculation: 30/101 = 29.7% ✅ Correct
```

#### Test Scenario 2: Convert to Repeat Customer
**Actions in System:**
1. Use "TestUser1" from Scenario 1
2. Create a 2nd completed order for them
3. Order amount: $75
4. Mark order as completed

**Expected Results:**
- "Total Customers" stays at 101
- "Repeat Customers" increases to 31
- "Repeat Rate" increases to ~30.7%
- TestUser1 appears in "Top Customers" table
- Purchase frequency: Move from "1 order" to "2 orders" category

**How to Verify:**
```
Before: TestUser1 has 1 order
Action: Complete 2nd order for TestUser1
After: TestUser1 has 2 orders
Repeat Customers: 30 → 31 ✅ Correct
Repeat Rate: 31/101 = 30.69% ✅ Correct
```

#### Test Scenario 3: Super Loyal Customer
**Actions in System:**
1. Create customer "TestUser2"
2. Create 6 completed orders for them over time
3. Amounts: $50, $60, $70, $80, $90, $100
4. Mark all as completed

**Expected Results:**
- TestUser2 appears at/near top of "Top Customers" table
- Shows: 6 orders, Total Spent = $450
- Purchase frequency shows +1 in "6+ orders" category
- Average orders per customer increases

**How to Verify:**
```
TestUser2 Total Spent = $50+$60+$70+$80+$90+$100 = $450 ✅
Order count = 6 ✅
Should be ranked by order count (highest first)
```

#### Test Scenario 4: Cohort Analysis
**Actions in System:**
1. Create 5 customers who joined in January
2. Give them varying order counts:
   - Customer A: 1 order
   - Customer B: 2 orders
   - Customer C: 3 orders
   - Customer D: 1 order
   - Customer E: 2 orders

**Expected Results:**
- Cohort "January 2026" shows:
  - 5 customers
  - 8 total orders (1+2+3+1+2)
  - Retention: 60% (3 out of 5 came back)

**How to Verify:**
```
January Cohort:
- Total: 5 customers
- Repeat: 3 customers (B, C, E)
- Retention: 3/5 = 60% ✅ Correct
```

### Common Bugs to Check
- [ ] **Bug**: Customer with 1 order counted as "repeat" → Check filter logic
- [ ] **Bug**: Total spent doesn't match sum of orders → Check calculation includes only completed orders
- [ ] **Bug**: Top customers table doesn't update → Check sorting/refresh logic
- [ ] **Bug**: Cohort shows wrong month → Check date grouping

### Manual Calculation to Verify
```
Repeat Customer Rate:
= (Customers with 2+ orders / Total customers) × 100

Example:
Total Customers: 100
Customers with 1 order: 70
Customers with 2+ orders: 30
Repeat Rate = (30 / 100) × 100 = 30% ✅
```

---

## KPI #3: Discord Engagement

### What It Does
Measures how active your Discord community is by tracking messages, reactions, and user engagement scores.

### Business Questions It Answers
- How active is our Discord community?
- Who are the most engaged members?
- Which channels are most popular?
- Are people interacting (reacting) with content?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Messages | Discord message events | User "Bob" sent message in #general |
| Reactions given | Users adding reactions | Bob reacted 👍 to Alice's message |
| Reactions received | Reactions on user's messages | Alice's message got 5 reactions |
| Channel activity | Channel IDs in messages | #general: 500 messages, #support: 200 |
| User ranks | Discord rank system | Bob is "Gold" rank with 1500 points |

### How to Test It

#### Test Scenario 1: Basic Message Activity
**Actions in Discord:**
1. Have 3 test users send messages:
   - User A: 10 messages in #general
   - User B: 5 messages in #support
   - User C: 3 messages in #announcements
2. Send messages over 1 hour period

**Expected Results:**
- "Total Messages" increases by +18
- "Active Users" shows 3
- Channel activity shows:
  - #general: +10 messages
  - #support: +5 messages
  - #announcements: +3 messages
- Engagement trend chart shows spike

**How to Verify:**
```
Before: Total Messages = 1000
Action: Send 18 messages (10+5+3)
After: Total Messages = 1018
Difference: 18 ✅ Correct
```

#### Test Scenario 2: Reactions Given
**Actions in Discord:**
1. User A sends 1 message in #general
2. User B adds 3 different reactions to that message: 👍 ❤️ 😂
3. User C adds 2 reactions: 👍 🔥

**Expected Results:**
- "Reactions Given" increases by +5
- User B: +3 reactions given
- User C: +2 reactions given
- Top contributors table updates rankings

**How to Verify:**
```
Before: User B reactions given = 50
Action: User B adds 3 reactions
After: User B reactions given = 53
Difference: 3 ✅ Correct
```

#### Test Scenario 3: Reactions Received
**Actions in Discord:**
1. User A sends 1 message
2. 5 different users react to it (10 reactions total)

**Expected Results:**
- "Reactions Received" increases by +10
- User A's "reactions received" count increases by +10
- User A's engagement score increases

**How to Verify:**
```
Before: User A reactions received = 20
Action: User A's message gets 10 reactions
After: User A reactions received = 30
Difference: 10 ✅ Correct
```

#### Test Scenario 4: Engagement Score Calculation
**Actions in Discord:**
1. User D performs these actions:
   - Sends 10 messages
   - Gives 5 reactions
   - Receives 15 reactions on their messages
   - Gets 3 "helpful" reactions (specific emoji)

**Expected Results:**
- User D's engagement score increases
- Score formula typically:
  - Messages sent × 1 point = 10
  - Reactions given × 0.5 points = 2.5
  - Reactions received × 2 points = 30
  - Helpful reactions × 5 points = 15
  - **Total Score: 57.5**

**How to Verify:**
```
Engagement Score Calculation:
Messages: 10 × 1 = 10
Reactions Given: 5 × 0.5 = 2.5
Reactions Received: 15 × 2 = 30
Helpful: 3 × 5 = 15
Total: 10 + 2.5 + 30 + 15 = 57.5 ✅

Dashboard should show User D score increased by ~58 points
```

#### Test Scenario 5: Channel Activity
**Actions in Discord:**
1. Send messages to different channels:
   - #general: 20 messages
   - #support: 15 messages
   - #trading: 10 messages
   - #off-topic: 5 messages

**Expected Results:**
- Channel activity bar chart shows:
  - #general: highest bar (20)
  - #support: 2nd highest (15)
  - #trading: 3rd (10)
  - #off-topic: 4th (5)
- Channels sorted by message count

**How to Verify:**
```
Count messages per channel manually:
#general: 20 messages ✅
#support: 15 messages ✅
Chart should show bars proportional to these counts
```

#### Test Scenario 6: Top Contributors
**Actions in Discord:**
1. Create activity for 5 users with varying engagement:
   - User A: 50 messages, 20 reactions given, 100 received
   - User B: 30 messages, 50 reactions given, 80 received
   - User C: 100 messages, 10 reactions given, 50 received
   - User D: 20 messages, 5 reactions given, 10 received
   - User E: 10 messages, 2 reactions given, 5 received

**Expected Results:**
- Top contributors table shows users ranked by engagement score
- Expected order (by score):
  1. User A or C (highest total engagement)
  2. User B
  3. User D
  4. User E

**How to Verify:**
```
Calculate each user's score:
User A: (50×1) + (20×0.5) + (100×2) = 50+10+200 = 260
User B: (30×1) + (50×0.5) + (80×2) = 30+25+160 = 215
User C: (100×1) + (10×0.5) + (50×2) = 100+5+100 = 205
User D: (20×1) + (5×0.5) + (10×2) = 20+2.5+20 = 42.5
User E: (10×1) + (2×0.5) + (5×2) = 10+1+10 = 21

Expected ranking: A (260) > B (215) > C (205) > D (42.5) > E (21) ✅
```

### Common Bugs to Check
- [ ] **Bug**: Bot messages counted → Should only count human messages
- [ ] **Bug**: Same user reacting multiple times counted separately → Should deduplicate
- [ ] **Bug**: Deleted messages still counted → Check message deletion handling
- [ ] **Bug**: Channel activity shows wrong channel names → Check channel ID mapping
- [ ] **Bug**: Engagement score negative → Check calculation formula

### Manual Calculation to Verify
```
Average Messages per User:
= Total Messages / Active Users

Example:
Total Messages: 1000
Active Users: 50
Average: 1000 / 50 = 20 messages per user ✅
```

---

# Support KPIs (4 KPIs)

## KPI #4: Support First Response Time

### What It Does
Measures how quickly your support team responds to new tickets.

### Business Questions It Answers
- How fast do we respond to customer inquiries?
- Are we meeting our SLA (Service Level Agreement)?
- Which agents are fastest/slowest?
- How many tickets are unanswered?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Ticket created time | Support ticket creation | Ticket #123 created at 10:00 AM |
| First response time | First agent reply timestamp | Agent replied at 10:15 AM (15 min response) |
| Agent who responded | Support agent user ID | Agent "Sarah" |
| SLA target | Configuration setting | Target: 15 minutes |
| Ticket status | Current ticket state | Open, In Progress, Resolved |

### How to Test It

#### Test Scenario 1: Fast Response (Within SLA)
**Actions in System:**
1. Create new support ticket at 10:00 AM
2. Set SLA target: 15 minutes
3. Have support agent reply at 10:10 AM (10 min later)
4. Note the agent name

**Expected Results:**
- Average response time: decreases (10 min < 15 min)
- SLA compliance: increases
- Tickets responded: +1
- Agent performance table shows:
  - Agent name
  - Response time: 10 minutes
  - SLA rate: increases (responded within target)

**How to Verify:**
```
Ticket Created: 10:00 AM
First Response: 10:10 AM
Response Time: 10 minutes ✅
SLA Target: 15 minutes
Within SLA: YES ✅
```

#### Test Scenario 2: Slow Response (Outside SLA)
**Actions in System:**
1. Create new ticket at 2:00 PM
2. SLA target: 15 minutes
3. Agent replies at 2:25 PM (25 min later)

**Expected Results:**
- Average response time: increases
- SLA compliance: decreases
- Dashboard shows this ticket missed SLA
- Agent's SLA rate decreases

**How to Verify:**
```
Ticket Created: 2:00 PM
First Response: 2:25 PM
Response Time: 25 minutes ✅
SLA Target: 15 minutes
Within SLA: NO ❌
SLA Compliance should decrease
```

#### Test Scenario 3: Multiple Agents Performance
**Actions in System:**
1. Create 10 tickets over 1 hour
2. Have 3 agents respond:
   - Agent A: 5 tickets, avg 8 min response
   - Agent B: 3 tickets, avg 20 min response
   - Agent C: 2 tickets, avg 5 min response

**Expected Results:**
- Agent performance table shows:
  - Agent C: Best SLA rate (5 min avg)
  - Agent A: Good SLA rate (8 min avg)
  - Agent B: Poor SLA rate (20 min avg)
- Color coding:
  - Agent C: Green (excellent)
  - Agent A: Green (within SLA)
  - Agent B: Red/Yellow (outside SLA)

**How to Verify:**
```
Agent A: 5 tickets × 8 min = 40 min total, avg = 8 min ✅
Agent B: 3 tickets × 20 min = 60 min total, avg = 20 min ✅
Agent C: 2 tickets × 5 min = 10 min total, avg = 5 min ✅

SLA Rate (15 min target):
Agent A: 5/5 = 100% ✅
Agent B: 0/3 = 0% (all over SLA) ✅
Agent C: 2/2 = 100% ✅
```

#### Test Scenario 4: Unanswered Tickets Alert
**Actions in System:**
1. Create 3 new tickets
2. DON'T have agents respond
3. Wait 20 minutes (past SLA)

**Expected Results:**
- Alert card appears: "⚠️ Unanswered Tickets"
- Shows table with 3 tickets:
  - Ticket numbers
  - Time elapsed (20+ minutes)
  - Status: "Waiting for response"
- Unanswered count: 3

**How to Verify:**
```
Tickets created: 3
Tickets responded: 0
Unanswered: 3 ✅
Time elapsed: >20 min for all 3 ✅
Alert should be visible with RED color
```

#### Test Scenario 5: SLA Target Change
**Actions in System:**
1. Current SLA compliance: 80% (with 15 min target)
2. Change SLA target from 15 min to 30 min
3. Refresh dashboard

**Expected Results:**
- SLA compliance percentage increases
- More tickets now "within SLA"
- Agent SLA rates all increase
- Chart updates to show new target line

**How to Verify:**
```
Example tickets:
- Ticket 1: 10 min response
- Ticket 2: 20 min response
- Ticket 3: 25 min response
- Ticket 4: 35 min response

SLA 15 min: 1/4 = 25% compliance
SLA 30 min: 3/4 = 75% compliance ✅

Dashboard should show updated percentage
```

### Common Bugs to Check
- [ ] **Bug**: First response counted when customer replies → Should only count agent responses
- [ ] **Bug**: Response time shows negative → Check timezone handling
- [ ] **Bug**: SLA compliance over 100% → Check calculation logic
- [ ] **Bug**: Unanswered tickets still show after response → Check refresh logic
- [ ] **Bug**: Agent performance doesn't update in real-time → Check data refresh

### Manual Calculation to Verify
```
Average Response Time:
= Sum of all response times / Number of tickets

Example:
Ticket 1: 10 min
Ticket 2: 15 min
Ticket 3: 20 min
Average: (10+15+20) / 3 = 15 minutes ✅

SLA Compliance:
= (Tickets within SLA / Total tickets) × 100

Example:
Total tickets: 10
Within SLA: 8
Compliance: (8/10) × 100 = 80% ✅
```

---

## KPI #5: Ticket to Order Conversion

### What It Does
Tracks how many support tickets result in actual orders/sales.

### Business Questions It Answers
- How effective is our support team at converting inquiries to sales?
- What's our conversion rate?
- How long does it take to convert a ticket to an order?
- Which ticket types convert best?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Tickets created | Support tickets | Ticket #456 created |
| Ticket type | Ticket category | "Product Inquiry", "Support", "Billing" |
| Orders created | Orders database | Order #789 created |
| Ticket-to-order link | Order metadata | Order #789 came from Ticket #456 |
| Conversion time | Time difference | Ticket created → Order placed |

### How to Test It

#### Test Scenario 1: Successful Conversion
**Actions in System:**
1. Create support ticket #100 at 10:00 AM
2. Customer asks: "How much is Premium service?"
3. Support agent responds with pricing
4. Customer places order #200 at 10:30 AM
5. Link order #200 to ticket #100

**Expected Results:**
- "Total Tickets" increases by +1
- "Converted to Orders" increases by +1
- "Conversion Rate" increases
- "Average Conversion Time" shows 30 minutes
- Conversion funnel shows +1 converted

**How to Verify:**
```
Before: Total Tickets = 100, Converted = 30 (30%)
Action: Create ticket + linked order
After: Total Tickets = 101, Converted = 31 (30.69%)

Conversion Time:
Ticket: 10:00 AM
Order: 10:30 AM
Time: 30 minutes ✅ Correct
```

#### Test Scenario 2: Non-Converting Ticket
**Actions in System:**
1. Create ticket #101 at 2:00 PM
2. Customer asks question
3. Support answers
4. Customer DOESN'T place order
5. Ticket closed without conversion

**Expected Results:**
- "Total Tickets" increases by +1
- "Converted to Orders" stays same
- "Conversion Rate" decreases slightly
- Ticket appears in "Non-converted" list

**How to Verify:**
```
Before: Total = 101, Converted = 31 (30.69%)
Action: Add non-converting ticket
After: Total = 102, Converted = 31 (30.39%)
Calculation: 31/102 = 30.39% ✅ Correct
```

#### Test Scenario 3: Fast vs Slow Conversion
**Actions in System:**
1. **Fast conversion:**
   - Create ticket #102 at 9:00 AM
   - Customer orders at 9:15 AM (15 min)
2. **Slow conversion:**
   - Create ticket #103 at 9:00 AM
   - Customer orders at 3:00 PM (6 hours)

**Expected Results:**
- Conversion time distribution shows:
  - "<1 hour" category: +1 (ticket #102)
  - "1-6 hours" category: +1 (ticket #103)
- Average conversion time recalculates
- Fastest conversion: 15 minutes
- Slowest conversion: 6 hours

**How to Verify:**
```
Ticket #102:
Created: 9:00 AM
Order: 9:15 AM
Time: 15 min = 0.25 hours ✅

Ticket #103:
Created: 9:00 AM
Order: 3:00 PM
Time: 6 hours ✅

Both should appear in correct time buckets
```

#### Test Scenario 4: Conversion by Ticket Type
**Actions in System:**
1. Create 10 tickets of different types:
   - "Product Inquiry": 5 tickets → 4 convert (80%)
   - "Support Issue": 3 tickets → 1 converts (33%)
   - "Billing Question": 2 tickets → 0 convert (0%)

**Expected Results:**
- Top converting types table shows:
  1. Product Inquiry: 80% conversion
  2. Support Issue: 33% conversion
  3. Billing Question: 0% conversion
- Chart shows conversion rate by type

**How to Verify:**
```
Product Inquiry: 4/5 = 80% ✅
Support Issue: 1/3 = 33.33% ✅
Billing Question: 0/2 = 0% ✅

Table should be sorted by conversion rate (highest first)
```

#### Test Scenario 5: Conversion Funnel
**Actions in System:**
1. Create 100 tickets total
2. 80 get responded to
3. 30 convert to orders
4. 25 of those orders complete

**Expected Results:**
- Conversion funnel shows:
  - Stage 1: 100 tickets created
  - Stage 2: 80 tickets responded (80% response rate)
  - Stage 3: 30 converted to orders (30% conversion)
  - Stage 4: 25 orders completed (83% completion)

**How to Verify:**
```
Tickets Created: 100 ✅
Tickets Responded: 80/100 = 80% ✅
Converted to Orders: 30/100 = 30% ✅
Orders Completed: 25/30 = 83.33% ✅

Funnel should show drop-off at each stage
```

### Common Bugs to Check
- [ ] **Bug**: Same ticket counted multiple times → Check deduplication
- [ ] **Bug**: Orders without ticket link counted as conversion → Should only count linked orders
- [ ] **Bug**: Conversion time negative → Check date/time handling
- [ ] **Bug**: Conversion rate over 100% → Check calculation logic
- [ ] **Bug**: Type breakdown doesn't add up to 100% → Check categorization

### Manual Calculation to Verify
```
Conversion Rate:
= (Tickets that led to orders / Total tickets) × 100

Example:
Total Tickets: 100
Converted: 25
Rate: (25/100) × 100 = 25% ✅

Average Conversion Time:
= Sum of conversion times / Number of conversions

Example:
Conversion 1: 30 min
Conversion 2: 60 min
Conversion 3: 45 min
Average: (30+60+45) / 3 = 45 minutes ✅
```

---

## KPI #6: Peak Ticket Times

### What It Does
Identifies when customers create the most support tickets (by hour, day, week).

### Business Questions It Answers
- When should we have more support agents online?
- What are our busiest hours/days?
- Do we have any patterns (weekends vs weekdays)?
- When is the quietest time?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Ticket creation time | Ticket timestamp | Ticket created at 2:30 PM on Monday |
| Day of week | Derived from timestamp | Monday, Tuesday, etc. |
| Hour of day | Derived from timestamp | 2 PM, 3 PM, etc. |
| Ticket count per period | Aggregated data | Monday 2 PM: 15 tickets |

### How to Test It

#### Test Scenario 1: Identify Peak Hour
**Actions in System:**
1. Create tickets at different hours today:
   - 9 AM: 5 tickets
   - 10 AM: 3 tickets
   - 11 AM: 2 tickets
   - 2 PM: 15 tickets (PEAK)
   - 3 PM: 8 tickets
   - 5 PM: 4 tickets

**Expected Results:**
- Peak times chart shows spike at 2 PM
- "Top Peak Times" list shows:
  1. "Today 2 PM - 15 tickets"
  2. "Today 3 PM - 8 tickets"
  3. "Today 9 AM - 5 tickets"
- Bar chart highest at 2 PM

**How to Verify:**
```
Manual count:
9 AM: 5 tickets ✅
2 PM: 15 tickets ✅ (Highest)
Chart should show 2 PM as tallest bar
```

#### Test Scenario 2: Weekday vs Weekend Pattern
**Actions in System:**
1. Create tickets over a week:
   - **Monday**: 20 tickets
   - **Tuesday**: 25 tickets
   - **Wednesday**: 22 tickets
   - **Thursday**: 18 tickets
   - **Friday**: 15 tickets
   - **Saturday**: 5 tickets
   - **Sunday**: 3 tickets

**Expected Results:**
- Chart shows weekdays (Mon-Fri) much higher than weekends
- Peak day: Tuesday (25 tickets)
- Lowest day: Sunday (3 tickets)
- Pattern: weekdays > weekends

**How to Verify:**
```
Weekday average: (20+25+22+18+15) / 5 = 20 tickets/day ✅
Weekend average: (5+3) / 2 = 4 tickets/day ✅
Weekdays are 5x busier than weekends ✅
```

#### Test Scenario 3: Period Comparison
**Actions in System:**
1. Select "Weekly" period
2. Create tickets:
   - Week 1: 100 tickets total
   - Week 2: 150 tickets total (PEAK week)
   - Week 3: 80 tickets total
3. Switch to "Monthly" period
4. Check aggregated data

**Expected Results:**
- Weekly view: Shows Week 2 as peak (150)
- Monthly view: Shows total for month (330 tickets)
- Period selector changes aggregation level

**How to Verify:**
```
Weekly totals:
Week 1: 100 ✅
Week 2: 150 ✅ (Peak)
Week 3: 80 ✅

Monthly total: 100+150+80 = 330 ✅
```

#### Test Scenario 4: Real-Time Update
**Actions in System:**
1. Note current hour's ticket count (e.g., 10 tickets)
2. Create 5 new tickets right now
3. Refresh dashboard

**Expected Results:**
- Current hour's count increases from 10 to 15
- Chart updates to show new spike
- "Live" indicator shows recent activity

**How to Verify:**
```
Before: Current hour = 10 tickets
Action: Create 5 tickets
After: Current hour = 15 tickets
Difference: 5 ✅ Correct
```

#### Test Scenario 5: No Activity Period
**Actions in System:**
1. Create tickets every hour EXCEPT 3 AM - 5 AM
2. Leave those hours empty

**Expected Results:**
- Chart shows gap/zero bars for 3 AM - 5 AM
- Peak times list doesn't include those hours
- Identifies 3-5 AM as "quietest period"

**How to Verify:**
```
3 AM: 0 tickets ✅
4 AM: 0 tickets ✅
5 AM: 0 tickets ✅
Chart should show empty bars for these hours
```

### Common Bugs to Check
- [ ] **Bug**: Timezone issues showing wrong peak hours → Check server vs client timezone
- [ ] **Bug**: Weekend showing as weekday → Check day calculation
- [ ] **Bug**: Peak times list shows wrong order → Check sorting logic
- [ ] **Bug**: Chart shows future hours → Check date filtering
- [ ] **Bug**: Duplicate counting of same ticket → Check aggregation logic

### Manual Calculation to Verify
```
Peak Hour Calculation:
= Count tickets created in each hour
= Find hour with maximum count

Example:
9 AM: 5 tickets
10 AM: 3 tickets
11 AM: 8 tickets (Peak) ✅
12 PM: 6 tickets

Peak hour should be: 11 AM with 8 tickets
```

---

## KPI #7: Support Reply Speed

### What It Does
Measures how fast support agents reply to customer messages within tickets (not just first response, but all replies).

### Business Questions It Answers
- How quickly do agents respond to customer follow-ups?
- Which agents are fastest at replying?
- What's our average reply time?
- Are we maintaining fast responses throughout the conversation?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Customer message | Ticket message timestamp | Customer sent message at 2:00 PM |
| Agent reply | Agent message timestamp | Agent replied at 2:05 PM |
| Reply time | Time difference | 5 minutes |
| Agent ID | Who replied | Agent "Mike" |
| Ticket ID | Which ticket | Ticket #789 |

### How to Test It

#### Test Scenario 1: Fast Agent
**Actions in System:**
1. Customer sends message in ticket at 10:00 AM
2. Agent "Sarah" replies at 10:03 AM (3 min)
3. Customer replies at 10:10 AM
4. Agent "Sarah" replies at 10:12 AM (2 min)

**Expected Results:**
- Agent Sarah's average reply time: (3+2)/2 = 2.5 minutes
- "Fastest Agent" metric shows Sarah
- Agent leaderboard ranks Sarah at top
- Total replies: +2

**How to Verify:**
```
Reply 1: 10:03 - 10:00 = 3 min ✅
Reply 2: 10:12 - 10:10 = 2 min ✅
Average: (3+2) / 2 = 2.5 min ✅
Sarah should appear as "Fastest Agent"
```

#### Test Scenario 2: Slow Agent
**Actions in System:**
1. Customer sends message at 1:00 PM
2. Agent "John" replies at 1:45 PM (45 min)
3. Customer replies at 2:00 PM
4. Agent "John" replies at 3:00 PM (60 min)

**Expected Results:**
- Agent John's average: (45+60)/2 = 52.5 minutes
- "Slowest Agent" metric shows John
- Agent leaderboard ranks John at bottom
- John's performance marked in red/yellow

**How to Verify:**
```
Reply 1: 1:45 PM - 1:00 PM = 45 min ✅
Reply 2: 3:00 PM - 2:00 PM = 60 min ✅
Average: (45+60) / 2 = 52.5 min ✅
John should appear as "Slowest Agent"
```

#### Test Scenario 3: Agent Leaderboard
**Actions in System:**
1. Create activity for 4 agents:
   - Agent A: 20 replies, avg 5 min
   - Agent B: 15 replies, avg 3 min (fastest)
   - Agent C: 10 replies, avg 10 min
   - Agent D: 25 replies, avg 7 min

**Expected Results:**
- Leaderboard sorted by speed (fastest first):
  1. Agent B: 3 min avg (fastest) 🥇
  2. Agent A: 5 min avg
  3. Agent D: 7 min avg
  4. Agent C: 10 min avg (slowest)
- Each agent shows reply count and average time

**How to Verify:**
```
Ranking by average reply time (ascending):
1. Agent B: 3 min ✅
2. Agent A: 5 min ✅
3. Agent D: 7 min ✅
4. Agent C: 10 min ✅

Total replies:
A: 20, B: 15, C: 10, D: 25 ✅
```

#### Test Scenario 4: Overall Average Calculation
**Actions in System:**
1. All agents combined send 100 replies
2. Total time spent: 500 minutes
3. Calculate system-wide average

**Expected Results:**
- "Average Reply Time" shows 5 minutes
- Metric card displays: "5 min"
- Chart shows trend over time

**How to Verify:**
```
Total replies: 100
Total time: 500 minutes
Average: 500 / 100 = 5 minutes ✅
```

#### Test Scenario 5: Performance Over Time
**Actions in System:**
1. Week 1: Agent "Emma" avg reply time = 8 min
2. Week 2: Agent "Emma" avg reply time = 6 min
3. Week 3: Agent "Emma" avg reply time = 4 min

**Expected Results:**
- Emma's performance improving (trending down)
- Chart shows downward trend
- Emma moves up in leaderboard rankings

**How to Verify:**
```
Week 1: 8 min
Week 2: 6 min (improvement: -2 min) ✅
Week 3: 4 min (improvement: -2 min) ✅
Trend: Improving ✅
```

### Common Bugs to Check
- [ ] **Bug**: Customer replies counted as agent replies → Check user role filtering
- [ ] **Bug**: Reply time shows days instead of minutes → Check time unit display
- [ ] **Bug**: Same reply counted multiple times → Check deduplication
- [ ] **Bug**: Leaderboard doesn't update → Check refresh logic
- [ ] **Bug**: Average calculation includes deleted messages → Check filtering

### Manual Calculation to Verify
```
Average Reply Time (per agent):
= Sum of all reply times / Number of replies

Example Agent:
Reply 1: 5 min
Reply 2: 3 min
Reply 3: 7 min
Reply 4: 10 min
Average: (5+3+7+10) / 4 = 6.25 minutes ✅

System Average:
= Sum of ALL agents' reply times / Total replies

Example:
Agent A: 100 min total (20 replies)
Agent B: 45 min total (15 replies)
System avg: (100+45) / (20+15) = 145/35 = 4.14 min ✅
```

---

# Operations KPIs (6 KPIs)

## KPI #8: Order Issues & Reports

### What It Does
Tracks problems reported with orders (payment issues, quality problems, delivery delays, etc.).

### Business Questions It Answers
- How many orders have issues?
- What types of issues are most common?
- Are we resolving issues quickly?
- Which services have the most problems?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Issue reports | Issue database | Issue #123 reported |
| Issue type | Category | "Payment Issue", "Quality Problem", "Delivery Delay" |
| Order ID | Linked order | Order #456 |
| Status | Current state | "Open", "In Progress", "Resolved" |
| Priority | Severity level | "Low", "Medium", "High", "Critical" |
| Creation date | When reported | Jan 15, 2026 10:30 AM |

### How to Test It

#### Test Scenario 1: Report New Issue
**Actions in System:**
1. Create completed order #500
2. Customer reports issue:
   - Type: "Payment Issue"
   - Description: "Charged twice"
   - Priority: "High"
   - Time: 3:00 PM

**Expected Results:**
- "Total Issues" increases by +1
- Issue type breakdown shows +1 "Payment Issue"
- Recent issues table shows new entry:
  - Order #500
  - Type: Payment Issue
  - Status: Open (red badge)
  - Priority: High (orange badge)
  - Date: Today 3:00 PM

**How to Verify:**
```
Before: Total Issues = 50
Action: Report 1 new issue
After: Total Issues = 51
Difference: 1 ✅

Issue details match:
- Order: #500 ✅
- Type: Payment Issue ✅
- Status: Open ✅
- Priority: High ✅
```

#### Test Scenario 2: Resolve Issue
**Actions in System:**
1. Take existing open issue #10
2. Investigate and fix problem
3. Change status to "Resolved"
4. Note resolution time

**Expected Results:**
- "Resolved Issues" increases by +1
- "Resolution Rate" percentage increases
- Issue #10 status badge changes to green "Resolved"
- Issue moves from "Open" to "Resolved" in breakdown

**How to Verify:**
```
Before: Resolved = 30, Total = 51, Rate = 58.8%
Action: Resolve issue #10
After: Resolved = 31, Total = 51, Rate = 60.8%
Calculation: 31/51 = 60.78% ✅
```

#### Test Scenario 3: Critical Issue
**Actions in System:**
1. Report new issue with:
   - Type: "Service Failure"
   - Priority: "Critical"
   - Description: "Order not delivered, customer angry"

**Expected Results:**
- "Critical Issues" count increases by +1
- Issue appears at top of list (sorted by priority)
- Red alert badge shows "Critical"
- Notification/alert may trigger for team

**How to Verify:**
```
Before: Critical Issues = 5
Action: Report 1 critical issue
After: Critical Issues = 6
Difference: 1 ✅

Issue should have:
- Priority badge: RED "Critical" ✅
- Position: Top of table ✅
```

#### Test Scenario 4: Issue Type Distribution
**Actions in System:**
1. Create 20 issues with different types:
   - Payment: 8 issues (40%)
   - Quality: 6 issues (30%)
   - Delivery: 4 issues (20%)
   - Technical: 2 issues (10%)

**Expected Results:**
- Pie chart shows distribution:
  - Payment: Largest slice (40%)
  - Quality: 30%
  - Delivery: 20%
  - Technical: Smallest (10%)
- Chart legend shows counts and percentages

**How to Verify:**
```
Total: 20 issues
Payment: 8/20 = 40% ✅
Quality: 6/20 = 30% ✅
Delivery: 4/20 = 20% ✅
Technical: 2/20 = 10% ✅
Total: 40+30+20+10 = 100% ✅
```

#### Test Scenario 5: Resolution Time Tracking
**Actions in System:**
1. Issue #20:
   - Created: Monday 9:00 AM
   - Resolved: Monday 11:00 AM
   - Resolution time: 2 hours
2. Issue #21:
   - Created: Monday 10:00 AM
   - Resolved: Tuesday 10:00 AM
   - Resolution time: 24 hours

**Expected Results:**
- Average resolution time updates
- Fast resolution (Issue #20) pulls average down
- Slow resolution (Issue #21) pulls average up
- Distribution chart shows:
  - "<6 hours": +1 (Issue #20)
  - "12-24 hours": +1 (Issue #21)

**How to Verify:**
```
Issue #20: 11:00 - 9:00 = 2 hours ✅
Issue #21: (Tues 10:00) - (Mon 10:00) = 24 hours ✅
Average: (2+24) / 2 = 13 hours ✅
```

### Common Bugs to Check
- [ ] **Bug**: Same issue counted multiple times → Check deduplication
- [ ] **Bug**: Resolved issues still show as "Open" → Check status update
- [ ] **Bug**: Resolution rate over 100% → Check calculation
- [ ] **Bug**: Issue type chart doesn't add to 100% → Check categorization
- [ ] **Bug**: Critical issues not highlighted → Check priority filtering

### Manual Calculation to Verify
```
Resolution Rate:
= (Resolved Issues / Total Issues) × 100

Example:
Total Issues: 50
Resolved: 35
Rate: (35/50) × 100 = 70% ✅

Average Resolution Time:
= Sum of resolution times / Number of resolved issues

Example:
Issue 1: 2 hours
Issue 2: 5 hours
Issue 3: 3 hours
Average: (2+5+3) / 3 = 3.33 hours ✅
```

---

## KPI #9: Order Completion Time

### What It Does
Measures how long orders take from creation to completion.

### Business Questions It Answers
- How fast do we complete orders?
- What's our average turnaround time?
- Which orders are fastest/slowest?
- Are we getting faster or slower over time?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Order created time | Order creation timestamp | Order #100 created Jan 15 at 10:00 AM |
| Order completed time | Order completion timestamp | Order #100 completed Jan 16 at 2:00 PM |
| Completion time | Calculated difference | 28 hours |
| Service type | Order category | "Premium Boost", "Standard Service" |
| Worker assigned | Who worked on it | Worker "Alex" |

### How to Test It

#### Test Scenario 1: Fast Order
**Actions in System:**
1. Create order #600 at 10:00 AM
2. Assign to worker
3. Worker completes at 11:30 AM (1.5 hours)
4. Mark order as "Completed"

**Expected Results:**
- "Fastest Completion" metric updates if 1.5hr is fastest
- Average completion time recalculates
- Time distribution shows +1 in "<1 hour" or "1-6 hours" bucket
- Completion trend chart updates

**How to Verify:**
```
Order Created: 10:00 AM
Order Completed: 11:30 AM
Time: 1.5 hours ✅

If previous fastest was 2 hours:
New fastest: 1.5 hours ✅
Metric should update
```

#### Test Scenario 2: Slow Order
**Actions in System:**
1. Create order #601 at Monday 9:00 AM
2. Order sits unassigned for 1 day
3. Worker starts Wednesday
4. Completes Friday 5:00 PM
5. Total time: ~5 days

**Expected Results:**
- "Slowest Completion" shows this order
- Average completion time increases
- Time distribution shows +1 in "3+ days" bucket
- May trigger alert if exceeds threshold

**How to Verify:**
```
Order Created: Monday 9:00 AM
Order Completed: Friday 5:00 PM
Time: ~5 days (120 hours) ✅

Slowest metric should show: 5 days ✅
```

#### Test Scenario 3: Average Calculation
**Actions in System:**
1. Complete 5 orders with different times:
   - Order A: 2 hours
   - Order B: 4 hours
   - Order C: 6 hours
   - Order D: 10 hours
   - Order E: 8 hours

**Expected Results:**
- Average completion time: 6 hours
- Median completion time: 6 hours (middle value)
- Metric cards show:
  - Average: 6 hours
  - Median: 6 hours
  - Fastest: 2 hours
  - Slowest: 10 hours

**How to Verify:**
```
Orders: 2, 4, 6, 8, 10 hours
Average: (2+4+6+8+10) / 5 = 30/5 = 6 hours ✅
Median: Sort [2,4,6,8,10], middle = 6 hours ✅
Fastest: 2 hours ✅
Slowest: 10 hours ✅
```

#### Test Scenario 4: Time Distribution
**Actions in System:**
1. Complete 20 orders in different time ranges:
   - <1 hour: 2 orders (10%)
   - 1-6 hours: 8 orders (40%)
   - 6-24 hours: 6 orders (30%)
   - 1-3 days: 3 orders (15%)
   - 3+ days: 1 order (5%)

**Expected Results:**
- Bar chart shows distribution:
  - Tallest bar: 1-6 hours (40%)
  - Smallest bar: 3+ days (5%)
- Percentages add up to 100%

**How to Verify:**
```
Total: 20 orders
<1hr: 2/20 = 10% ✅
1-6hr: 8/20 = 40% ✅
6-24hr: 6/20 = 30% ✅
1-3d: 3/20 = 15% ✅
3+d: 1/20 = 5% ✅
Sum: 10+40+30+15+5 = 100% ✅
```

#### Test Scenario 5: Trend Over Time
**Actions in System:**
1. Week 1: 10 orders, avg 8 hours
2. Week 2: 10 orders, avg 6 hours (improving)
3. Week 3: 10 orders, avg 4 hours (improving more)

**Expected Results:**
- Trend chart shows downward slope (getting faster)
- Week-over-week improvement visible
- Chart annotations show improvement percentage

**How to Verify:**
```
Week 1: 8 hours average
Week 2: 6 hours average (25% faster)
Week 3: 4 hours average (33% faster)
Trend: IMPROVING ✅
Chart should slope downward
```

### Common Bugs to Check
- [ ] **Bug**: In-progress orders counted as completed → Check status filtering
- [ ] **Bug**: Completion time shows negative → Check date calculation
- [ ] **Bug**: Average doesn't update after new order → Check refresh logic
- [ ] **Bug**: Distribution percentages don't add to 100% → Check bucketing
- [ ] **Bug**: Trend shows wrong dates → Check period grouping

### Manual Calculation to Verify
```
Completion Time (single order):
= Completed timestamp - Created timestamp

Example:
Created: Jan 15, 10:00 AM
Completed: Jan 15, 2:30 PM
Time: 4.5 hours ✅

Average Completion Time:
= Sum of all completion times / Number of completed orders

Example:
Order 1: 4 hours
Order 2: 6 hours
Order 3: 5 hours
Average: (4+6+5) / 3 = 5 hours ✅

Median Completion Time:
= Middle value when sorted

Example:
Times: [4, 6, 5] → Sorted: [4, 5, 6]
Median: 5 hours ✅
```

---

## KPI #10: Service Request Measurement

### What It Does
Tracks requests for services (quotes, inquiries) before they become actual orders.

### Business Questions It Answers
- How many service requests do we get?
- What services are most requested?
- How many requests are fulfilled vs pending?
- What's our completion rate?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Request created | Service request creation | Request #100 created |
| Service type | What customer wants | "Premium Boost", "Account Recovery" |
| Status | Current state | "Pending", "In Progress", "Completed" |
| Request date | Timestamp | Jan 15, 2026 3:00 PM |

### How to Test It

#### Test Scenario 1: New Service Request
**Actions in System:**
1. Customer submits request for "Premium Boost"
2. Request #700 created at 2:00 PM
3. Status: "Pending"

**Expected Results:**
- "Total Requests" increases by +1
- "Pending Requests" increases by +1
- Service type breakdown shows +1 "Premium Boost"
- Recent requests table shows new entry

**How to Verify:**
```
Before: Total = 100, Pending = 20
Action: Create 1 new request
After: Total = 101, Pending = 21
Difference: +1 for both ✅
```

#### Test Scenario 2: Complete Request
**Actions in System:**
1. Take pending request #700
2. Process the request
3. Change status to "Completed"

**Expected Results:**
- "Completed Requests" increases by +1
- "Pending Requests" decreases by -1
- "Completion Rate" percentage increases
- Status badge changes from yellow to green

**How to Verify:**
```
Before: Completed = 60, Pending = 21, Rate = 59.4%
Action: Complete request #700
After: Completed = 61, Pending = 20, Rate = 60.4%
Calculations:
- 61 / 101 = 60.39% ✅
- Pending: 21 - 1 = 20 ✅
```

#### Test Scenario 3: Service Type Distribution
**Actions in System:**
1. Create 50 requests of different types:
   - Premium Boost: 20 requests (40%)
   - Account Recovery: 15 requests (30%)
   - Custom Service: 10 requests (20%)
   - Other: 5 requests (10%)

**Expected Results:**
- Bar chart shows distribution:
  - Premium Boost: Tallest bar (40%)
  - Account Recovery: 2nd (30%)
  - Custom Service: 3rd (20%)
  - Other: Smallest (10%)
- Chart sorted by count (descending)

**How to Verify:**
```
Total: 50 requests
Premium: 20/50 = 40% ✅
Recovery: 15/50 = 30% ✅
Custom: 10/50 = 20% ✅
Other: 5/50 = 10% ✅
```

#### Test Scenario 4: Completion Rate by Service
**Actions in System:**
1. Premium Boost: 10 total, 9 completed (90%)
2. Account Recovery: 10 total, 5 completed (50%)
3. Custom Service: 10 total, 8 completed (80%)

**Expected Results:**
- Service comparison shows:
  - Premium Boost: 90% completion (highest)
  - Custom Service: 80% completion
  - Account Recovery: 50% completion (lowest)
- May indicate which services are easier/harder to fulfill

**How to Verify:**
```
Premium: 9/10 = 90% ✅
Custom: 8/10 = 80% ✅
Recovery: 5/10 = 50% ✅
Overall: (9+8+5) / (10+10+10) = 22/30 = 73.3% ✅
```

#### Test Scenario 5: Request Volume Over Time
**Actions in System:**
1. January: 100 requests
2. February: 150 requests (+50%)
3. March: 120 requests (-20%)

**Expected Results:**
- Trend chart shows:
  - Upward slope Jan → Feb
  - Downward slope Feb → Mar
- Month-over-month growth visible
- Total cumulative: 370 requests

**How to Verify:**
```
Jan: 100 requests
Feb: 150 requests (50% increase) ✅
Mar: 120 requests (20% decrease from Feb) ✅
Total: 100+150+120 = 370 ✅
```

### Common Bugs to Check
- [ ] **Bug**: Cancelled requests counted as completed → Check status filtering
- [ ] **Bug**: Completion rate over 100% → Check calculation
- [ ] **Bug**: Service type "Other" too large → Check categorization
- [ ] **Bug**: Pending count doesn't decrease when completed → Check status update
- [ ] **Bug**: Duplicate requests counted → Check deduplication

### Manual Calculation to Verify
```
Completion Rate:
= (Completed Requests / Total Requests) × 100

Example:
Total: 100
Completed: 75
Rate: (75/100) × 100 = 75% ✅

Service Type Distribution:
= (Requests of type / Total requests) × 100

Example:
Total: 100
Premium Boost: 40
Distribution: (40/100) × 100 = 40% ✅
```

---

## KPI #11: Service Request Conversion

### What It Does
Tracks how many service request quotes actually turn into completed orders.

### Business Questions It Answers
- How many quotes become actual sales?
- What's our quote-to-order conversion rate?
- How much revenue comes from converted quotes?
- Which services have the best conversion rates?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Quote created | Quote/request creation | Quote #200 created |
| Quote amount | Quoted price | $150 |
| Order created | Linked order | Order #500 from Quote #200 |
| Order completed | Order completion | Order #500 completed |
| Revenue | Order payment amount | $150 paid |

### How to Test It

#### Test Scenario 1: Quote Converts to Order
**Actions in System:**
1. Create quote #800 for $100 at 10:00 AM
2. Customer accepts quote
3. Create order #900 linked to quote #800
4. Complete order #900
5. Payment of $100 received

**Expected Results:**
- "Total Quotes" increases by +1
- "Converted to Orders" increases by +1
- "Conversion Rate" increases
- "Total Revenue from Conversions" increases by +$100
- Conversion funnel shows progression

**How to Verify:**
```
Before: Quotes = 50, Converted = 20, Rate = 40%
Action: Quote converts to completed order
After: Quotes = 51, Converted = 21, Rate = 41.2%
Calculation: 21/51 = 41.18% ✅

Revenue:
Before: $2,000
After: $2,100
Increase: $100 ✅
```

#### Test Scenario 2: Quote NOT Converted
**Actions in System:**
1. Create quote #801 for $200
2. Customer declines or doesn't respond
3. Quote expires or is cancelled
4. No order created

**Expected Results:**
- "Total Quotes" increases by +1
- "Converted to Orders" stays same
- "Conversion Rate" decreases slightly
- Quote appears in "Non-converted" list

**How to Verify:**
```
Before: Quotes = 51, Converted = 21, Rate = 41.2%
Action: Add non-converting quote
After: Quotes = 52, Converted = 21, Rate = 40.4%
Calculation: 21/52 = 40.38% ✅
```

#### Test Scenario 3: Conversion Funnel
**Actions in System:**
1. Create 100 quotes
2. 60 get accepted → 60 orders created
3. 45 of those orders get completed
4. 40 payments received

**Expected Results:**
- Funnel visualization shows:
  - Stage 1: 100 quotes created
  - Stage 2: 60 orders created (60% acceptance)
  - Stage 3: 45 orders completed (75% completion)
  - Stage 4: 40 paid (89% payment)
- Drop-off visible at each stage

**How to Verify:**
```
Quotes: 100 ✅
Orders Created: 60/100 = 60% ✅
Orders Completed: 45/60 = 75% ✅
Orders Paid: 40/45 = 88.89% ✅

End-to-end conversion: 40/100 = 40% ✅
```

#### Test Scenario 4: Conversion by Service Type
**Actions in System:**
1. Premium Boost: 20 quotes → 18 convert (90%)
2. Account Recovery: 20 quotes → 10 convert (50%)
3. Custom Service: 20 quotes → 12 convert (60%)

**Expected Results:**
- Service conversion table shows:
  1. Premium Boost: 90% (highest)
  2. Custom Service: 60%
  3. Account Recovery: 50% (lowest)
- Helps identify which services sell best

**How to Verify:**
```
Premium: 18/20 = 90% ✅
Custom: 12/20 = 60% ✅
Recovery: 10/20 = 50% ✅
Overall: (18+12+10) / (20+20+20) = 40/60 = 66.67% ✅
```

#### Test Scenario 5: Revenue Tracking
**Actions in System:**
1. 10 quotes convert with varying amounts:
   - Quote A: $50 → Order completed
   - Quote B: $100 → Order completed
   - Quote C: $150 → Order completed
   - Quote D: $200 → Order completed
   - Quote E: $75 → Order completed
   - (5 more quotes, various amounts)

**Expected Results:**
- "Total Revenue from Conversions" shows sum
- Average order value calculated
- Revenue chart shows trend

**How to Verify:**
```
Converted orders: 10
Total revenue: $50+$100+$150+$200+$75+... = $X
Average: $X / 10 = $Y per order ✅
```

### Common Bugs to Check
- [ ] **Bug**: Orders without quote link counted → Should only count linked orders
- [ ] **Bug**: Pending orders counted as converted → Only count completed
- [ ] **Bug**: Conversion rate over 100% → Check calculation
- [ ] **Bug**: Revenue includes refunds → Should be gross revenue only
- [ ] **Bug**: Duplicate conversions counted → Check deduplication

### Manual Calculation to Verify
```
Conversion Rate:
= (Quotes that became completed orders / Total quotes) × 100

Example:
Total Quotes: 100
Converted (completed orders): 45
Rate: (45/100) × 100 = 45% ✅

Total Revenue from Conversions:
= Sum of all converted order amounts

Example:
Order 1: $50
Order 2: $100
Order 3: $75
Total: $50+$100+$75 = $225 ✅
```

---

## KPI #12: Worker Performance

### What It Does
Tracks how well workers are performing: orders completed, customer ratings, earnings, etc.

### Business Questions It Answers
- Who are our top-performing workers?
- What's the average worker rating?
- How many orders does each worker complete?
- How much do workers earn?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Worker info | Workers table | Worker "Alex", Discord: alex#1234 |
| Orders completed | Order assignments | Alex completed 25 orders |
| Customer ratings | Rating system | Alex has 4.5 star average |
| Earnings | Payment calculations | Alex earned $2,000 (80% of order values) |
| Order value | Order amounts | Orders totaling $2,500 |

### How to Test It

#### Test Scenario 1: Worker Completes Order
**Actions in System:**
1. Assign order #1000 ($100) to worker "Alex"
2. Alex completes the order
3. Customer rates Alex 5 stars
4. Alex receives payout: $80 (80% of $100)

**Expected Results:**
- Alex's order count: +1
- Alex's total earned: +$80
- Alex's rating updates (may go up or stay same)
- "Total Orders Completed" system-wide: +1
- Worker leaderboard updates

**How to Verify:**
```
Order value: $100
Worker payout: $100 × 0.80 = $80 ✅

Before: Alex completed 24 orders, earned $1,920
After: Alex completed 25 orders, earned $2,000
Difference: +1 order, +$80 ✅
```

#### Test Scenario 2: Worker Gets Poor Rating
**Actions in System:**
1. Worker "Bob" (current rating: 4.5) completes order
2. Customer gives 2-star rating
3. Bob's average rating recalculates

**Expected Results:**
- Bob's rating decreases from 4.5 to lower
- Bob may drop in leaderboard ranking
- Low rating flagged for review

**How to Verify:**
```
Before: Bob has 4.5 average from 10 ratings
Total stars: 4.5 × 10 = 45 stars
Action: Add 2-star rating
After: 45 + 2 = 47 stars / 11 ratings = 4.27 ✅
Bob's new rating: 4.27 (decreased)
```

#### Test Scenario 3: Worker Leaderboard
**Actions in System:**
1. Create performance data for 5 workers:
   - Alex: 50 orders, 4.8 rating, $4,000 earned
   - Bob: 30 orders, 4.2 rating, $2,400 earned
   - Carol: 45 orders, 4.9 rating, $3,600 earned
   - Dave: 20 orders, 4.0 rating, $1,600 earned
   - Emma: 40 orders, 4.7 rating, $3,200 earned

**Expected Results:**
- Leaderboard sorted by performance score (orders × rating):
  1. Carol: 45 × 4.9 = 220.5 (highest)
  2. Alex: 50 × 4.8 = 240 (or use different formula)
  3. Emma: 40 × 4.7 = 188
  4. Bob: 30 × 4.2 = 126
  5. Dave: 20 × 4.0 = 80 (lowest)

**How to Verify:**
```
Assuming score = orders × rating:
Carol: 45 × 4.9 = 220.5 ✅
Alex: 50 × 4.8 = 240 ✅
Emma: 40 × 4.7 = 188 ✅
Bob: 30 × 4.2 = 126 ✅
Dave: 20 × 4.0 = 80 ✅

Ranking: Alex > Carol > Emma > Bob > Dave
```

#### Test Scenario 4: Rating Distribution
**Actions in System:**
1. Collect all ratings across all workers:
   - 5 stars: 30 ratings (30%)
   - 4 stars: 40 ratings (40%)
   - 3 stars: 20 ratings (20%)
   - 2 stars: 8 ratings (8%)
   - 1 star: 2 ratings (2%)

**Expected Results:**
- Bar chart shows distribution:
  - 4 stars: Tallest bar (40%)
  - 5 stars: 2nd tallest (30%)
  - 3 stars: 20%
  - 2 stars: 8%
  - 1 star: Smallest (2%)
- Average rating: ~4.0 stars

**How to Verify:**
```
Total ratings: 100
5★: 30 × 5 = 150
4★: 40 × 4 = 160
3★: 20 × 3 = 60
2★: 8 × 2 = 16
1★: 2 × 1 = 2
Total stars: 388
Average: 388 / 100 = 3.88 stars ✅
```

#### Test Scenario 5: Earnings Calculation
**Actions in System:**
1. Worker "Frank" completes 10 orders:
   - Order values: $50, $100, $75, $200, $150, $80, $120, $90, $110, $125
   - Total order value: $1,100

**Expected Results:**
- Frank's earnings: $880 (80% of $1,100)
- Average per order: $88
- Total displayed correctly

**How to Verify:**
```
Order values: $50+$100+$75+$200+$150+$80+$120+$90+$110+$125 = $1,100
Worker payout (80%): $1,100 × 0.80 = $880 ✅
Average: $880 / 10 = $88 per order ✅
```

### Common Bugs to Check
- [ ] **Bug**: In-progress orders counted as completed → Check status filter
- [ ] **Bug**: Earnings calculation wrong → Verify 80% formula
- [ ] **Bug**: Rating shows > 5.0 → Check validation
- [ ] **Bug**: Leaderboard doesn't update → Check refresh
- [ ] **Bug**: Worker not shown if 0 orders → Check null handling

### Manual Calculation to Verify
```
Worker Earnings:
= Sum of (completed order values × 0.80)

Example:
Order 1: $100 → Worker gets $80
Order 2: $50 → Worker gets $40
Order 3: $150 → Worker gets $120
Total earnings: $80+$40+$120 = $240 ✅

Average Rating:
= Sum of all ratings / Number of ratings

Example:
Ratings: 5, 4, 5, 3, 4 (5 ratings)
Sum: 5+4+5+3+4 = 21
Average: 21 / 5 = 4.2 stars ✅

Average Orders per Worker:
= Total completed orders / Number of workers

Example:
Total orders: 100
Workers: 10
Average: 100 / 10 = 10 orders per worker ✅
```

---

## KPI #13: Worker Issues

### What It Does
Tracks problems or complaints related to workers (performance issues, customer complaints, policy violations).

### Business Questions It Answers
- How many worker-related issues do we have?
- What types of issues are most common?
- Which workers have the most issues?
- Are we resolving worker issues?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Issue report | Issue database | Issue #50 reported |
| Worker involved | Worker ID | Worker "Alex" |
| Issue type | Category | "Poor Quality", "Behavior", "Delay" |
| Severity | Priority level | "Low", "Medium", "High", "Critical" |
| Status | Current state | "Open", "Investigating", "Resolved" |

### How to Test It

#### Test Scenario 1: Report Worker Issue
**Actions in System:**
1. Customer complains about worker "John"
2. Create issue:
   - Type: "Poor Quality"
   - Severity: "Medium"
   - Description: "Work not done correctly"
   - Time: 4:00 PM

**Expected Results:**
- "Total Issues" increases by +1
- Worker John's issue count: +1
- Issue type breakdown shows +1 "Poor Quality"
- Recent issues table shows new entry

**How to Verify:**
```
Before: Total Issues = 20
Action: Report 1 new issue
After: Total Issues = 21
Difference: +1 ✅

Worker John issues:
Before: 2 issues
After: 3 issues
Difference: +1 ✅
```

#### Test Scenario 2: Critical Issue
**Actions in System:**
1. Report critical issue:
   - Type: "Policy Violation"
   - Severity: "Critical"
   - Worker: "BadWorker"
   - Description: "Used inappropriate language with customer"

**Expected Results:**
- "Critical Issues" count: +1
- Issue appears at top of list (red badge)
- May trigger admin notification
- Worker may be flagged for review

**How to Verify:**
```
Before: Critical Issues = 3
Action: Report critical issue
After: Critical Issues = 4
Difference: +1 ✅

Badge color: RED "Critical" ✅
Position in table: Top ✅
```

#### Test Scenario 3: Resolve Worker Issue
**Actions in System:**
1. Take open issue #60
2. Investigate (talk to worker, review work)
3. Issue resolved, worker retrained
4. Change status to "Resolved"

**Expected Results:**
- "Resolved Issues" increases by +1
- "Resolution Rate" percentage increases
- Issue #60 badge changes to green
- Worker's resolved issue count increases

**How to Verify:**
```
Before: Resolved = 15, Total = 21, Rate = 71.4%
Action: Resolve issue #60
After: Resolved = 16, Total = 21, Rate = 76.2%
Calculation: 16/21 = 76.19% ✅
```

#### Test Scenario 4: Issue Type Distribution
**Actions in System:**
1. Create 30 worker issues:
   - Poor Quality: 12 issues (40%)
   - Delays: 9 issues (30%)
   - Behavior: 6 issues (20%)
   - Other: 3 issues (10%)

**Expected Results:**
- Pie chart shows:
  - Poor Quality: Largest slice (40%)
  - Delays: 30%
  - Behavior: 20%
  - Other: 10%

**How to Verify:**
```
Total: 30 issues
Poor Quality: 12/30 = 40% ✅
Delays: 9/30 = 30% ✅
Behavior: 6/30 = 20% ✅
Other: 3/30 = 10% ✅
Sum: 100% ✅
```

#### Test Scenario 5: Problem Worker Identification
**Actions in System:**
1. Track issues per worker:
   - Worker A: 10 issues (problem worker)
   - Worker B: 2 issues
   - Worker C: 1 issue
   - Worker D: 3 issues
   - Worker E: 0 issues (excellent)

**Expected Results:**
- Table shows workers with most issues:
  1. Worker A: 10 issues (flagged)
  2. Worker D: 3 issues
  3. Worker B: 2 issues
  4. Worker C: 1 issue
  5. Worker E: 0 issues
- Worker A may be highlighted for management review

**How to Verify:**
```
Ranking by issue count:
1. A: 10 issues ✅
2. D: 3 issues ✅
3. B: 2 issues ✅
4. C: 1 issue ✅
5. E: 0 issues ✅
```

### Common Bugs to Check
- [ ] **Bug**: Same issue counted multiple times → Check deduplication
- [ ] **Bug**: Resolved issues still show as open → Check status update
- [ ] **Bug**: Resolution rate over 100% → Check calculation
- [ ] **Bug**: Issue type chart totals wrong → Check categorization
- [ ] **Bug**: Worker name doesn't match → Check worker ID mapping

### Manual Calculation to Verify
```
Resolution Rate:
= (Resolved Issues / Total Issues) × 100

Example:
Total: 30
Resolved: 20
Rate: (20/30) × 100 = 66.67% ✅

Issues per Worker (average):
= Total Issues / Number of Workers

Example:
Total Issues: 30
Workers: 10
Average: 30 / 10 = 3 issues per worker ✅
```

---

# Financial KPI (1 KPI)

## KPI #14: Financial Overview

### What It Does
Shows complete financial picture: revenue, expenses, profit, and system wallet balance.

### Business Questions It Answers
- How much money are we making?
- What are our expenses?
- What's our profit margin?
- How much money is in our system wallet?

### What Data It Needs

| Data Point | Where It Comes From | Example |
|-----------|-------------------|---------|
| Order revenue | Completed orders | $10,000 total from 100 orders |
| Worker payouts | Automatic 80% | $8,000 paid to workers |
| Support payouts | Automatic 5% | $500 paid to support |
| System cut (gross profit) | Automatic 15% | $1,500 kept by system |
| Operational expenses | Expense records | $300 server costs, $200 marketing |
| Net profit | Calculated | $1,500 - $500 = $1,000 |
| System wallet | Wallet balance | $5,450.75 available |

### How to Test It

#### Test Scenario 1: Simple Order Financial Flow
**Actions in System:**
1. Customer places order for $100
2. Order completed
3. System automatically calculates:
   - Worker gets: $80 (80%)
   - Support gets: $5 (5%)
   - System keeps: $15 (15% gross profit)

**Expected Results:**
- "Total Revenue" increases by +$100
- "Gross Profit" increases by +$15
- "Total Expenses" increases by +$85 (workers + support)
- Worker payouts shows +$80
- Support payouts shows +$5

**How to Verify:**
```
Order amount: $100

Distribution:
Worker (80%): $100 × 0.80 = $80 ✅
Support (5%): $100 × 0.05 = $5 ✅
System (15%): $100 × 0.15 = $15 ✅
Total: $80 + $5 + $15 = $100 ✅

Gross Profit = $15 ✅
```

#### Test Scenario 2: Multiple Orders Revenue
**Actions in System:**
1. Complete 10 orders with varying amounts:
   - Orders: $50, $100, $75, $200, $150, $80, $120, $90, $110, $125
   - Total: $1,100

**Expected Results:**
- Total Revenue: $1,100
- Gross Profit: $165 (15% of $1,100)
- Worker Payouts: $880 (80% of $1,100)
- Support Payouts: $55 (5% of $1,100)
- Total Expenses: $935 ($880 + $55)

**How to Verify:**
```
Total Revenue: $1,100 ✅

Breakdowns:
Gross Profit: $1,100 × 0.15 = $165 ✅
Worker Payouts: $1,100 × 0.80 = $880 ✅
Support Payouts: $1,100 × 0.05 = $55 ✅
Total Expenses: $880 + $55 = $935 ✅
```

#### Test Scenario 3: Add Operational Expense
**Actions in System:**
1. System has $1,500 gross profit
2. Add operational expense:
   - Type: "Server Hosting"
   - Amount: $200
   - Date: Today

**Expected Results:**
- "Operational Expenses" increases by +$200
- "Total Expenses" increases by +$200
- "Net Profit" decreases by -$200
- Expense breakdown shows new entry

**How to Verify:**
```
Before:
Gross Profit: $1,500
Operational Expenses: $300
Net Profit: $1,500 - $300 = $1,200

After:
Operational Expenses: $300 + $200 = $500
Net Profit: $1,500 - $500 = $1,000
Decrease: $1,200 - $1,000 = $200 ✅
```

#### Test Scenario 4: Profit Margin Calculation
**Actions in System:**
1. Complete orders totaling $10,000 revenue
2. Gross profit: $1,500 (15%)
3. Operational expenses: $500
4. Net profit: $1,000

**Expected Results:**
- Gross Profit Margin: 15%
- Net Profit Margin: 10%
- Metric cards show:
  - Total Revenue: $10,000
  - Gross Profit: $1,500 (15%)
  - Net Profit: $1,000 (10%)

**How to Verify:**
```
Revenue: $10,000
Gross Profit: $1,500
Operational Expenses: $500
Net Profit: $1,500 - $500 = $1,000

Gross Margin: ($1,500 / $10,000) × 100 = 15% ✅
Net Margin: ($1,000 / $10,000) × 100 = 10% ✅
```

#### Test Scenario 5: System Wallet Balance
**Actions in System:**
1. Starting wallet balance: $5,000
2. Receive gross profit from 10 orders: +$1,500
3. Pay operational expenses: -$500
4. New balance should be: $6,000

**Expected Results:**
- System wallet card shows: $6,000.00 USD
- Green background (positive balance)
- Balance updates in real-time

**How to Verify:**
```
Starting: $5,000
+ Gross Profit: $1,500
- Expenses: $500
= Final: $5,000 + $1,500 - $500 = $6,000 ✅
```

#### Test Scenario 6: Loss Scenario (Negative Profit)
**Actions in System:**
1. Revenue: $1,000
2. Gross Profit: $150 (15%)
3. Operational Expenses: $300 (high)
4. Net Profit: $150 - $300 = -$150 (LOSS)

**Expected Results:**
- Net Profit card shows: -$150.00 (in RED)
- Net margin: -15%
- System indicates loss
- Wallet balance may decrease

**How to Verify:**
```
Gross Profit: $150
Operational Expenses: $300
Net Profit: $150 - $300 = -$150 ✅

Net Margin: (-$150 / $1,000) × 100 = -15% ✅
Card should be RED ✅
```

#### Test Scenario 7: Average Order Value
**Actions in System:**
1. Complete 50 orders
2. Total revenue: $5,000
3. Calculate average

**Expected Results:**
- Average Order Value: $100
- Displayed in metric subtext
- "50 orders • Avg: $100.00"

**How to Verify:**
```
Total Revenue: $5,000
Total Orders: 50
Average: $5,000 / 50 = $100 ✅
```

#### Test Scenario 8: Period Comparison
**Actions in System:**
1. **Monthly**: Revenue $10,000, Net Profit $800
2. **Yearly**: Revenue $100,000, Net Profit $8,000
3. Switch between periods

**Expected Results:**
- Period selector changes data display
- Monthly shows smaller numbers
- Yearly shows 10x larger (if 10 months data)
- Charts update accordingly

**How to Verify:**
```
Monthly:
Revenue: $10,000 ✅
Net Profit: $800 ✅

Yearly:
Revenue: ~$100,000 ✅
Net Profit: ~$8,000 ✅

Yearly should be ~10x monthly if consistent
```

#### Test Scenario 9: Complete Financial Breakdown
**Actions in System:**
1. Run complete financial report:
   - Total Revenue: $50,000
   - Orders: 500
   - Avg Order: $100

**Expected Results:**
- Expense Breakdown shows:
  - Worker Payouts (80%): $40,000
  - Support Payouts (5%): $2,500
  - Operational Expenses: $3,000
  - **Total Expenses: $45,500**

- Profit Summary:
  - Gross Profit (15%): $7,500
  - Net Profit: $4,500
  - Net Margin: 9%

**How to Verify:**
```
Revenue: $50,000
Orders: 500
Avg: $50,000 / 500 = $100 ✅

Expenses:
Workers: $50,000 × 0.80 = $40,000 ✅
Support: $50,000 × 0.05 = $2,500 ✅
Operational: $3,000 (from records) ✅
Total: $40,000 + $2,500 + $3,000 = $45,500 ✅

Profit:
Gross: $50,000 × 0.15 = $7,500 ✅
Net: $7,500 - $3,000 = $4,500 ✅
Net Margin: ($4,500 / $50,000) × 100 = 9% ✅
```

### Common Bugs to Check
- [ ] **Bug**: Pending orders counted in revenue → Should only count completed
- [ ] **Bug**: Refunds not subtracted → Check revenue calculation
- [ ] **Bug**: Expense percentages don't add up → 80% + 5% + 15% must = 100%
- [ ] **Bug**: Net profit calculation wrong → Check gross profit - operational expenses
- [ ] **Bug**: Wallet balance negative but shows positive → Check sign handling
- [ ] **Bug**: Margins over 100% → Check division calculation

### Manual Calculation to Verify
```
COMPLETE FINANCIAL FORMULA:

Step 1: Calculate Revenue
Total Revenue = Sum of all completed order amounts

Step 2: Calculate Automatic Expenses
Worker Payouts = Total Revenue × 0.80
Support Payouts = Total Revenue × 0.05
Gross Profit (System Cut) = Total Revenue × 0.15

Step 3: Calculate Total Expenses
Total Expenses = Worker Payouts + Support Payouts + Operational Expenses

Step 4: Calculate Net Profit
Net Profit = Gross Profit - Operational Expenses
(or: Net Profit = Total Revenue - Total Expenses)

Step 5: Calculate Margins
Gross Profit Margin = (Gross Profit / Total Revenue) × 100
Net Profit Margin = (Net Profit / Total Revenue) × 100

EXAMPLE:
Revenue: $10,000
Orders: 100

Workers: $10,000 × 0.80 = $8,000
Support: $10,000 × 0.05 = $500
Gross Profit: $10,000 × 0.15 = $1,500

Operational: $300 (from expense records)
Total Expenses: $8,000 + $500 + $300 = $8,800

Net Profit: $1,500 - $300 = $1,200
(verify: $10,000 - $8,800 = $1,200 ✅)

Gross Margin: ($1,500 / $10,000) × 100 = 15% ✅
Net Margin: ($1,200 / $10,000) × 100 = 12% ✅
```

---

## General Testing Tips

### For ALL KPIs:

1. **Test Empty States**
   - What happens when there's no data?
   - Should show "0" or "No data available", not errors

2. **Test Period Switching**
   - Daily → Weekly → Monthly → Quarterly → Yearly
   - Data should update for each period
   - No errors when switching

3. **Test Real-Time Updates**
   - Create new data
   - Refresh dashboard
   - New data should appear

4. **Test Edge Cases**
   - Very large numbers (millions)
   - Very small numbers (decimals)
   - Exactly zero
   - Negative values (where applicable)

5. **Test Calculations**
   - Use calculator to verify math
   - Percentages should be correct
   - Averages should be accurate
   - Totals should sum correctly

6. **Test Data Consistency**
   - Same data across different views
   - Charts match tables
   - Summary cards match details

---

## Quick Testing Checklist

For each KPI, verify:
- [ ] Data loads without errors
- [ ] Metric cards show correct values
- [ ] Charts display properly
- [ ] Tables show recent records
- [ ] Period selector works
- [ ] Calculations are accurate
- [ ] No "undefined" or "null" text
- [ ] Empty states handled gracefully
- [ ] Colors/badges correct
- [ ] Sorting works correctly

---

**This guide covers ALL 14 KPIs with business-focused testing scenarios. Use it to verify each KPI works correctly with real data from your system!**
