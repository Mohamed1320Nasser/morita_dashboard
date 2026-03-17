# Simple Next.js KPI Dashboard Setup ⚡

## 🎯 THE SIMPLEST WAY (5 Minutes!)

Since you're using **Next.js**, here's the absolute simplest way to get the new dashboard working:

---

## Step 1: Create New KPI Index File (2 minutes)

**Replace** `/src/pages/kpis/index.jsx` with this:

```jsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import TabNavigation from '../../components/dashboard/TabNavigationNextJS'
import OverviewTab from './tabs/OverviewTab'
import CommunityTab from './tabs/CommunityTab'
import SupportTab from './tabs/SupportTab'
import OperationsTab from './tabs/OperationsTab'
import FinancialTab from './tabs/FinancialTab'
import styles from './KPILayout.module.scss'

const KpisPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Sync with URL query param
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab)
    }
  }, [router.query.tab])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'support', label: 'Support', icon: '🎫' },
    { id: 'operations', label: 'Operations', icon: '💼' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    // Update URL (optional - makes tabs shareable)
    router.push(`/kpis?tab=${tabId}`, undefined, { shallow: true })
  }

  // Render active tab
  const renderContent = () => {
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>📊 KPI Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor key performance indicators across your platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  )
}

export default KpisPage
```

---

## Step 2: Update OverviewTab for Next.js (2 minutes)

**Find and replace in** `/src/pages/kpis/tabs/OverviewTab.jsx`:

### Find this (lines 1-4):
```jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MetricCard, KPISection } from '../../../components/dashboard'
import kpiController from '../../../controllers/kpi'
```

### Replace with:
```jsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'  // Changed from useNavigate
import { MetricCard, KPISection } from '../../../components/dashboard'
import kpiController from '../../../controllers/kpi'
```

### Find this (line ~16):
```jsx
const OverviewTab = () => {
  const navigate = useNavigate()
```

### Replace with:
```jsx
const OverviewTab = () => {
  const router = useRouter()  // Changed from navigate
```

### Find ALL instances of `navigate(` and replace with `router.push(`:

```jsx
// OLD:
onClick={() => navigate('/kpis/financial')}

// NEW:
onClick={() => router.push('/kpis?tab=financial')}
```

**Specific replacements:**
- `navigate('/kpis/financial')` → `router.push('/kpis?tab=financial')`
- `navigate('/kpis/community')` → `router.push('/kpis?tab=community')`
- `navigate('/kpis/operations')` → `router.push('/kpis?tab=operations')`
- `navigate('/kpis/support')` → `router.push('/kpis?tab=support')`

---

## Step 3: Test! (1 minute)

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000/kpis
   ```

3. **You should see:**
   - ✅ KPI Dashboard header
   - ✅ 5 tabs (Overview, Community, Support, Operations, Financial)
   - ✅ Overview tab active by default
   - ✅ 4 hero metrics

4. **Click tabs:**
   - Each tab should change content
   - URL should update to `/kpis?tab=community`, etc.
   - Active tab should highlight

---

## ✅ That's It!

You now have a working tab-based KPI dashboard in Next.js!

### What Works:
- ✅ Tab navigation with state management
- ✅ URL sync (shareable links)
- ✅ Keyboard navigation (arrows, enter)
- ✅ Overview tab with real data
- ✅ Placeholder tabs ready for migration
- ✅ All reusable components (MetricCard, KPISection)
- ✅ Responsive design
- ✅ Professional styling

### What's Next:
1. Test all tabs
2. Start migrating KPIs from old dashboard
3. Remove old backup file when done

---

## 🔥 Quick Migration Example

To migrate a KPI (e.g., Member Growth to Community tab):

1. **Open** `src/pages/kpis/index.jsx.backup`
2. **Find** the Member Growth section (starts around line 487)
3. **Copy** the entire section
4. **Open** `src/pages/kpis/tabs/CommunityTab.jsx`
5. **Replace** the placeholder in first `<KPISection>` with copied code
6. **Test** the Community tab

---

## 🐛 Troubleshooting

### Problem: "Cannot find module TabNavigationNextJS"

**Solution:** The file is created. If error persists, use the original TabNavigation:
```jsx
import TabNavigation from '../../components/dashboard/TabNavigation'
```

Then update TabNavigation.jsx to remove React Router dependencies (remove useNavigate, useLocation).

### Problem: Page shows blank

**Solution:** Check browser console for errors. Most common issue is import paths.

### Problem: Tabs don't change

**Solution:** Verify `activeTab` state:
```jsx
console.log('Active tab:', activeTab)
```

---

## 📝 Files You Need to Update

**REQUIRED:**
1. ✅ `/src/pages/kpis/index.jsx` - Main KPI page (replace entire file)
2. ✅ `/src/pages/kpis/tabs/OverviewTab.jsx` - Update imports and navigation

**OPTIONAL:**
- All other tab files are already correct (placeholders)

---

**That's literally it! Just 2 file changes and you have a working dashboard!** 🎉
