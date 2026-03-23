# Settings Page Refactor Plan

## Overview
Transform the settings page into a modern, professional dashboard focusing on core system configurations while removing redundant sections that have dedicated management pages.

## Current Issues

1. **Redundant Sections**: Services and Payment Methods have their own dedicated pages
   - Services: `/pages/services/index.jsx`
   - Payment Methods: `/pages/payments/methods.jsx`

2. **Layout Issues**:
   - All sections stacked vertically
   - No visual hierarchy
   - Discord channels section is too long
   - Inconsistent spacing and grouping

3. **UI/UX Issues**:
   - Plain card layouts
   - No visual separation between critical and informational sections
   - Discord publishing info box too verbose
   - System Information section is static and not actionable

## Proposed Structure

### Three Main Sections:

#### 1. **Financial Configuration** (Critical - Top Priority)
- Payout Configuration (Worker/Support/System percentages)
- Visual improvements:
  - Add percentage slider with visual feedback
  - Real-time calculation preview
  - Pie chart showing distribution
  - History button to view past configurations

#### 2. **Discord Integration** (Important - Secondary)
- Bot connection status (condensed)
- Channel publishing management
- Improvements:
  - Collapsible channel cards
  - Grouped by status (Needs Update, Published, Never Published)
  - Quick actions in header
  - Move detailed info to tooltips/popovers

#### 3. **System Settings** (Informational - Tertiary)
- Environment information
- System metadata
- Quick links to related pages
- Improvements:
  - Compact card format
  - Link to Services page
  - Link to Payment Methods page
  - Add more useful system info (uptime, version, etc.)

## Detailed Changes

### Remove Sections:
- ❌ Active Services card → Link to `/services`
- ❌ Payment Methods card → Link to `/payments/methods`
- ❌ Configuration Notes card → Move to tooltips/help icons

### Update Payout Configuration:

**New Features:**
- Add visual percentage distribution (pie/donut chart or bar chart)
- Add "View History" button to see past configurations
- Add real-time preview of how $100 order would be split
- Add validation indicators (green checkmark when 100%)
- Add tooltips explaining each percentage
- Add "Reset to Default" button

**UI Improvements:**
- Use range sliders instead of number inputs (optional)
- Add percentage bars showing distribution visually
- Add animation when values change
- Highlight active configuration

### Update Discord Channels:

**Layout Changes:**
- Add tabs or filter buttons: All / Needs Update / Published / Never Published
- Collapsible channel cards (collapsed by default for published)
- Move publishing info to collapsible help section
- Add bulk actions in header (Publish All, Refresh All)

**UI Improvements:**
- Status indicators with icons and colors
- Last published relative time (e.g., "2 hours ago")
- Channel type icons
- Condensed details view
- Expand/collapse individual cards
- Loading skeleton states

### New System Settings Card:

**Information to Display:**
- Environment (Development/Production)
- Default Currency
- Timezone
- System Version (if available)
- Backend URL
- Quick Links section

**Quick Links:**
- Services Management → `/services`
- Payment Methods → `/payments/methods`
- Categories → `/categories`
- Users Management → `/users`

## Component Structure

```
settings/
├── index.jsx (Main container)
├── settings.module.scss (Styles)
└── components/
    ├── PayoutConfiguration/
    │   ├── PayoutForm.jsx
    │   ├── PayoutDistributionChart.jsx
    │   ├── PayoutHistory.jsx (Modal)
    │   └── PayoutConfiguration.module.scss
    ├── DiscordManagement/
    │   ├── DiscordStatus.jsx
    │   ├── ChannelCard.jsx
    │   ├── ChannelFilters.jsx
    │   ├── PublishModal.jsx
    │   └── DiscordManagement.module.scss
    └── SystemInfo/
        ├── SystemInfoCard.jsx
        ├── QuickLinks.jsx
        └── SystemInfo.module.scss
```

## New Features to Add

### 1. Payout History Modal
- Show all past configurations
- Display who created/updated
- Show date ranges when each was active
- Allow reverting to previous config (creates new active config with old values)

### 2. Payout Distribution Visualization
- Pie chart or donut chart showing 80/5/15 split
- Color-coded segments
- Interactive hover states
- Updates in real-time as percentages change

### 3. Discord Channel Grouping
- Group channels by status
- Collapsible groups
- Show count badges (e.g., "Needs Update (3)")

### 4. Quick Actions Bar
- Add floating action bar at top of page
- Quick access to most common actions:
  - Save Payout Config
  - Publish All Channels
  - Refresh Status

### 5. Better Empty States
- If no payout config exists, show onboarding UI
- If Discord bot disconnected, show troubleshooting steps

## Design System Updates

### Colors:
- Success: #22c55e (Published, Active)
- Warning: #f59e0b (Needs Update)
- Danger: #ef4444 (Error, Never Published)
- Info: #3b82f6 (Informational)
- Neutral: #6b7280 (Disabled, Secondary)

### Spacing:
- Section gap: 2rem
- Card padding: 1.5rem
- Inner spacing: 1rem
- Compact spacing: 0.5rem

### Typography:
- Page title: 1.75rem, bold
- Section title: 1.25rem, semibold
- Card title: 1rem, semibold
- Body text: 0.875rem, regular
- Helper text: 0.75rem, regular

### Cards:
- Border radius: 12px
- Border: 1px solid #e5e7eb
- Shadow on hover: 0 4px 12px rgba(0, 0, 0, 0.08)
- Transition: all 0.2s ease

## Implementation Phases

### Phase 1: Cleanup (Priority: High)
- Remove Services card
- Remove Payment Methods card
- Remove Configuration Notes card
- Add Quick Links section to System Info

### Phase 2: Payout Enhancements (Priority: High)
- Add distribution visualization (chart)
- Add validation indicators
- Improve form layout with better spacing
- Add tooltips
- Style improvements

### Phase 3: Payout History (Priority: Medium)
- Create History modal
- Add "View History" button
- Implement history display
- Add revert functionality

### Phase 4: Discord Improvements (Priority: Medium)
- Add channel grouping/filtering
- Make cards collapsible
- Improve status indicators
- Add relative timestamps
- Condense details

### Phase 5: Polish & Optimization (Priority: Low)
- Add loading skeletons
- Add animations
- Improve responsive design
- Add keyboard shortcuts
- Performance optimization

## Breaking Down Implementation

### Files to Create:
1. `/pages/settings/components/PayoutConfiguration/PayoutForm.jsx`
2. `/pages/settings/components/PayoutConfiguration/PayoutDistributionChart.jsx`
3. `/pages/settings/components/PayoutConfiguration/PayoutHistory.jsx`
4. `/pages/settings/components/PayoutConfiguration/PayoutConfiguration.module.scss`
5. `/pages/settings/components/DiscordManagement/DiscordStatus.jsx`
6. `/pages/settings/components/DiscordManagement/ChannelCard.jsx`
7. `/pages/settings/components/DiscordManagement/ChannelFilters.jsx`
8. `/pages/settings/components/DiscordManagement/DiscordManagement.module.scss`
9. `/pages/settings/components/SystemInfo/SystemInfoCard.jsx`
10. `/pages/settings/components/SystemInfo/QuickLinks.jsx`
11. `/pages/settings/components/SystemInfo/SystemInfo.module.scss`

### Files to Modify:
1. `/pages/settings/index.jsx` (Main refactor)
2. `/pages/settings/settings.module.scss` (Update styles)

### Backend Work (if needed):
- Ensure `/payout-config/history` endpoint returns proper data structure
- Add pagination to history if needed

## Expected Outcome

### Before:
- 6 large cards stacked vertically
- ~800 lines of code in one file
- Redundant information
- Poor visual hierarchy
- Cluttered interface

### After:
- 3 focused sections with clear hierarchy
- Modular components (~200 lines each)
- No redundancy
- Professional, modern UI
- Easy to navigate and use
- Better performance (code splitting)

## Accessibility Considerations
- Add proper ARIA labels
- Keyboard navigation for all interactive elements
- Focus indicators
- Screen reader announcements for status changes
- High contrast mode support

## Mobile Responsiveness
- Stack sections vertically on mobile
- Collapsible sections by default on small screens
- Touch-friendly button sizes (min 44px)
- Simplified layout for narrow viewports

## Performance Optimizations
- Lazy load chart library
- Code split settings components
- Memoize expensive calculations
- Debounce API calls
- Optimize re-renders with React.memo

## Testing Requirements
- Test payout percentage validation
- Test Discord channel publishing flow
- Test responsive layouts
- Test accessibility
- Test error states
- Test loading states

## Documentation Needs
- Update admin documentation
- Add inline help/tooltips
- Create user guide for settings
- Document API changes (if any)
