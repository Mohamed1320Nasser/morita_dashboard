# Next.js Implementation Guide - KPI Dashboard

## 🔍 Discovery: You're Using Next.js!

Your project uses **Next.js** (file-based routing), not React Router. This means we need a slightly different approach.

---

## 📝 Next.js Routing Differences

### React Router (what the guides assumed):
```
/kpis → KPILayout
  /kpis/overview → OverviewTab
  /kpis/community → CommunityTab
```

### Next.js (what you actually have):
```
/kpis → /pages/kpis/index.jsx (single file)
```

---

## ✅ Solution: Tab State Management

Instead of separate route files, we'll:
1. Use the existing `/pages/kpis/index.jsx` file
2. Add tab state management
3. Render different tab components based on active tab
4. Update URL with query params (optional: `/kpis?tab=overview`)

---

## 🚀 Implementation Steps

### Step 1: Update `/pages/kpis/index.jsx`

Replace the entire content of `/pages/kpis/index.jsx` with this new structure:

```jsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { TabNavigation } from '../../components/dashboard'
import OverviewTab from './tabs/OverviewTab'
import CommunityTab from './tabs/CommunityTab'
import SupportTab from './tabs/SupportTab'
import OperationsTab from './tabs/OperationsTab'
import FinancialTab from './tabs/FinancialTab'
import styles from './KPILayout.module.scss'

const KpisPage = () => {
  const router = useRouter()

  // Get initial tab from URL query param or default to 'overview'
  const initialTab = router.query.tab || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'support', label: 'Support', icon: '🎫' },
    { id: 'operations', label: 'Operations', icon: '💼' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    // Update URL without page reload (optional)
    router.push(`/kpis?tab=${tabId}`, undefined, { shallow: true })
  }

  // Render active tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'community':
        return <CommunityTab />
      case 'support':
        return <SupportTab />
      case 'operations':
        return <OperationsTab />
      case 'financial':
        return <FinancialTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className={styles.kpiLayout}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>📊 KPI Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor key performance indicators across your platform
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <div className={styles.content}>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default KpisPage
```

---

### Step 2: Update TabNavigation Component

The TabNavigation component needs to work with Next.js instead of React Router:

**File:** `/src/components/dashboard/TabNavigation.jsx`

Replace the entire content with:

```jsx
import React from 'react'
import PropTypes from 'prop-types'
import styles from './TabNavigation.module.scss'

/**
 * TabNavigation - Tab-based navigation (Next.js version)
 */
const TabNavigation = ({ tabs = [], activeTab, onTabChange }) => {
  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  const handleKeyDown = (e, tabId) => {
    // Keyboard navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTabClick(tabId)
    }

    // Arrow key navigation
    const currentIndex = tabs.findIndex(t => t.id === activeTab)

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % tabs.length
      handleTabClick(tabs[nextIndex].id)
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
      handleTabClick(tabs[prevIndex].id)
    }
  }

  return (
    <div className={styles.tabNavigation}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const tabClasses = [
            styles.tab,
            isActive ? styles['tab--active'] : ''
          ].filter(Boolean).join(' ')

          return (
            <button
              key={tab.id}
              className={tabClasses}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
              <span className={styles.label}>{tab.label}</span>
              {tab.badge && (
                <span className={styles.badge}>{tab.badge}</span>
              )}
            </button>
          )
        })}
      </div>
      <div className={styles.indicator} />
    </div>
  )
}

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
}

export default TabNavigation
```

---

### Step 3: Update OverviewTab Navigation

The OverviewTab has navigation calls that need to be updated for Next.js:

**File:** `/src/pages/kpis/tabs/OverviewTab.jsx`

Find all instances of:
```jsx
onClick={() => navigate('/kpis/financial')}
```

Replace with:
```jsx
onClick={() => router.push('/kpis?tab=financial')}
```

And add at the top of the component:
```jsx
import { useRouter } from 'next/router'

const OverviewTab = () => {
  const router = useRouter()
  // ... rest of component
```

**Full updated OverviewTab navigation sections:**

```jsx
import { useRouter } from 'next/router'  // Add this import

const OverviewTab = () => {
  const router = useRouter()  // Add this line

  // ... existing state and useEffect ...

  return (
    <div className={styles.overviewTab}>
      {/* Hero Metrics Section */}
      <section className={styles.heroSection}>
        <h2 className={styles.sectionTitle}>Key Metrics</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            label="Total Revenue"
            value={heroMetrics.revenue?.value || '$0'}
            trend={heroMetrics.revenue?.trend}
            icon="💰"
            color="financial"
            loading={loading}
            onClick={() => router.push('/kpis?tab=financial')}  // Updated
          />
          <MetricCard
            label="Net Profit"
            value={heroMetrics.profit?.value || '$0'}
            trend={heroMetrics.profit?.trend}
            icon="💚"
            color="success"
            loading={loading}
            onClick={() => router.push('/kpis?tab=financial')}  // Updated
          />
          <MetricCard
            label="Active Members"
            value={heroMetrics.members?.value || '0'}
            trend={heroMetrics.members?.trend}
            icon="👥"
            color="community"
            loading={loading}
            onClick={() => router.push('/kpis?tab=community')}  // Updated
          />
          <MetricCard
            label="Avg Response Time"
            value={heroMetrics.responseTime?.value || '0 min'}
            trend={heroMetrics.responseTime?.trend}
            icon="⏱️"
            color="support"
            loading={loading}
            onClick={() => router.push('/kpis?tab=support')}  // Updated
          />
        </div>
      </section>

      {/* Quick Actions */}
      <KPISection title="Quick Actions" icon="⚡" ...>
        <div className={styles.actionsGrid}>
          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=financial')}  // Updated
          >
            {/* ... */}
          </button>

          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=operations')}  // Updated
          >
            {/* ... */}
          </button>

          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=support')}  // Updated
          >
            {/* ... */}
          </button>

          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=community')}  // Updated
          >
            {/* ... */}
          </button>
        </div>
      </KPISection>

      {/* ... rest of component ... */}
    </div>
  )
}
```

---

## 🧪 Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to `/kpis`**
   - Should see Overview tab by default
   - Should show 4 hero metrics

3. **Click tabs:**
   - URL should update to `/kpis?tab=community`, etc.
   - Content should change
   - Active tab should highlight

4. **Test browser navigation:**
   - Back/forward buttons should work
   - Refresh page should preserve active tab

5. **Test keyboard:**
   - Tab key to focus tabs
   - Arrow keys to navigate
   - Enter/Space to activate

---

## 📊 What You'll See

### `/kpis` (Overview tab):
- 4 hero metrics
- System health cards
- Quick action buttons
- Welcome card

### `/kpis?tab=community`:
- Placeholder for Member Growth
- Placeholder for Repeat Customers
- Placeholder for Discord Engagement

### `/kpis?tab=support`:
- Placeholders for 4 support KPIs

### `/kpis?tab=operations`:
- Placeholders for 6 operations KPIs

### `/kpis?tab=financial`:
- Placeholder for financial KPI

---

## 🔧 Troubleshooting

### Problem: "Cannot find module 'next/router'"

**Solution:** Make sure Next.js is installed:
```bash
npm install next
```

### Problem: Tabs don't change content

**Solution:** Check that `activeTab` state is updating:
```jsx
console.log('Active tab:', activeTab)
```

### Problem: URL doesn't update

**Solution:** Verify `router.push()` is working:
```jsx
const handleTabChange = (tabId) => {
  console.log('Changing to tab:', tabId)
  setActiveTab(tabId)
  router.push(`/kpis?tab=${tabId}`, undefined, { shallow: true })
}
```

### Problem: Page reloads on tab click

**Solution:** Make sure using `shallow: true` in router.push

---

## ✅ Checklist

Before moving forward:

- [ ] Updated `/pages/kpis/index.jsx` with new structure
- [ ] Updated `/components/dashboard/TabNavigation.jsx` for Next.js
- [ ] Updated OverviewTab to use `useRouter()` instead of `useNavigate()`
- [ ] Tested tab navigation works
- [ ] Verified URL updates with `?tab=` param
- [ ] Confirmed all 5 tabs show content
- [ ] Browser back/forward works

---

## 🎉 Next Steps

After tabs are working:

1. **Backup old code:**
   ```bash
   cp src/pages/kpis/index.jsx src/pages/kpis/index.jsx.backup
   ```

2. **Implement new structure**

3. **Test thoroughly**

4. **Start migrating KPIs:**
   - Week 1: Community KPIs
   - Week 2: Support KPIs
   - Week 3: Operations KPIs
   - Week 4: Financial KPI

---

**You're using Next.js, so the implementation is slightly different but the components and design system we built are still 100% usable!** 🚀
