# Feature Landscape: v1.4 Layout Simplification

**Domain:** Test Report Visualization (Qase Report Layout Refactor)
**Researched:** 2026-02-11
**Confidence:** HIGH (verified against Allure, ReportPortal, Playwright patterns)
**Milestone:** v1.4 Layout Simplification

---

## Executive Summary

Qase Report v1.4 removes the sidebar entirely and introduces three core UI changes based on test reporter ecosystem patterns:

1. **Persistent status bar** (pass/fail counts + run metadata in top bar) — Table stakes feature. Every modern test reporter displays this. Currently in sidebar; must move to AppBar as compact donut + text.

2. **Modal test details** (instead of right drawer) — Differentiator. Modals are the preferred pattern for secondary info because they don't consume permanent screen real estate and maintain context better. Focus trap + Escape key support required.

3. **Dropdown hamburger menu** (navigation via Menu component) — Navigation replacement when sidebar removed. **Important:** Desktop users expect visible dropdown with text labels (not just icon) per NN/G research showing 39% slower completion with hidden-only menus.

Research shows **hamburger menus are discoverability antipatterns on desktop** — this is why MUI Menu with visible/descriptive options (not hidden) is recommended. Mobile responsive drawer is deferred to v1.5.

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Current State | Migration |
|---------|--------------|------------|---------------|-----------|
| **Persistent pass/fail/skipped statistics** | Every test reporter displays run summary in header/footer. Users expect quick status overview in every view | Low | ✓ Sidebar shows donut + counts | Move to AppBar. Keep existing ProgressRingCard component; add text labels + run metadata (date, duration, env) |
| **Navigation to all views** | Switching between Overview, Tests, Clusters, Gallery, Comparison must be one-click | Low | ✓ Sidebar has 5 nav items | Move to dropdown Menu in AppBar. Desktop: always open Menu (text + icon). Mobile deferred to v1.5 |
| **Test detail inspection** | Users need to view test steps, errors, attachments, parameters with full scrollable content | Medium | ✓ Right drawer (temporary overlay) | Convert Drawer → Dialog(Modal). Same content layout, better UX (no permanent space waste, proper focus mgmt) |
| **Test list filtering** | Status/suite/stability filters essential for finding specific tests | Low | ✓ Sidebar has filter chips | Move to test list view header as persistent filter bar. Keep MobX filter state |
| **Search by test name** | ⌘K command palette essential for quick lookup | Low | ✓ Works | No changes needed |
| **Export results** | Users want to export run data, individual test details | Low | ✓ Works | No changes needed |

---

## Differentiators

Features that set Qase Report apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Current State | Implementation |
|---------|-------------------|------------|---------------|-----------------|
| **Compact persistent status bar with run metadata** | Pass rate ring + passed/failed/skipped/blocked/invalid counts + date + duration + environment visible in EVERY view. No sidebar needed to check overall results | Low | 🔄 Partial (sidebar only) | Design new AppBar layout: donut (24px) + "N passed, M failed, K skipped" (text) + run date/time + env label. **Must be sticky/fixed** |
| **Instant modal test details with context preservation** | Click test → modal opens instantly with scrollable content. No page transition. Close = return to exact position in test list | Low | 🔄 Refactor (drawer → modal) | Use Dialog component. Keep TestDetails structure. Add keyboard support (Esc closes). Focus trap for a11y |
| **Dropdown menu navigation (desktop-optimized)** | Single-click access to all views. Menu text visible (not just icon). Research shows 2x better discoverability vs hidden hamburger | Medium | 🔄 Replace sidebar | Create Menu with list items for Overview/Tests/Clusters/Gallery/Comparison. Keep text labels visible on desktop |
| **Inline filter persistence** | Filters always visible in test list header. No context switch needed to adjust. State synced with MobX store | Low | 🔄 Refactor | Move SidebarFilters → TestListFilters (new location). Add chipset to TestList header. Maintain filter state |
| **Status donut with progress label** | Show pass rate as animated ring with "87% passed" text. Compact, at-a-glance metric | Low | ✓ Exists (ProgressRingCard) | Reuse in AppBar. Size: 48px diameter (donut), 14px text below |
| **Color-coded run metadata** | Environment (staging/prod), duration trend (normal/slow), status (success/failed) all visible at a glance | Low | 🔄 New | Add chip components to AppBar status bar: env label (e.g., "staging" in blue), duration (e.g., "2m 14s" in grey), last run date |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Hidden hamburger menu on desktop** | NN/G research: hamburger menus reduce discoverability by 50% on desktop, increase task time by 39%. Users expect to see navigation options | Use Menu with visible text labels. Show "Overview", "Tests", "Clusters", etc. in readable dropdown. Only hide on mobile (v1.5) |
| **Sidebar as optional toggle** | Creates two navigation paradigms. Users confused: "Is it hamburger or sidebar?" One source of truth required | Remove sidebar entirely. Use Menu as the ONLY primary navigation |
| **Sticky/fixed TestDetails drawer** | Defeats purpose of removing sidebar. Would still consume permanent screen space | Use Modal (Dialog) which overlays and can be dismissed. Returns screen to test list on close |
| **Modal that shows when no test selected** | Users shouldn't see empty modals. Modal should only appear when user clicks a test | Keep "Select a test to view details" message in TestDetails component. Only open modal when selectedTest exists |
| **Multiple filter locations** | Filters in both sidebar AND test list header = redundancy and confusion | Filters ONLY in test list header. Single source of truth |
| **Status bar that scrolls away** | If pass rate ring disappears when scrolling, defeats purpose of "persistent." Must always be visible | Use AppBar with position: sticky (stays at top during scroll). Test with long test lists |
| **Modal without keyboard support** | Accessibility failure. Users expect Escape key to close, Tab to navigate, focus to trap inside modal | Use Dialog component; MUI handles this. Verify focus management in QA |

---

## Feature Dependencies

```
PERSISTENT STATUS BAR
  ├─ ProgressRingCard (reuse existing)
  ├─ Pass/fail/skipped/blocked/invalid stats from reportStore
  ├─ Run date/time from reportStore.runData.start_time
  ├─ Environment label from reportStore.runData.env
  └─ AppBar redesign to accommodate donut + text

DROPDOWN HAMBURGER MENU
  ├─ MUI Menu component (existing)
  ├─ MUI IconButton(MenuIcon) (existing)
  ├─ Navigation state in MobX (activeView already exists)
  ├─ List of views: [
  │   { label: 'Overview', view: 'dashboard' },
  │   { label: 'Tests', view: 'tests' },
  │   { label: 'Failure Clusters', view: 'failure-clusters' },
  │   { label: 'Gallery', view: 'gallery' },
  │   { label: 'Comparison', view: 'comparison' }
  │ ]
  └─ useRootStore().setActiveView(viewName)

MODAL TEST DETAILS
  ├─ Dialog component (existing in MUI)
  ├─ TestDetails component (reuse content)
  ├─ selectedTest state (already in MobX)
  ├─ clearSelection() handler (already exists)
  ├─ Keyboard support: Escape to close, Tab to trap focus
  └─ Focus management: restore focus to test item when modal closes

INLINE TEST FILTERS
  ├─ TestListFilters component (move from Sidebar)
  ├─ Filter state in MobX (filterStatus, filterSuite, filterStability)
  ├─ TestList header area (add above virtual list)
  ├─ Chip/Badge components for filter display (existing)
  └─ Filter update handlers (already exist)

REMOVE SIDEBAR
  ├─ Delete Sidebar component
  ├─ Delete SidebarStats component
  ├─ Delete SidebarFilters component
  ├─ Update MainLayout to NOT render Sidebar
  ├─ Update Sidebar prop in store.tsx (isDockOpen, closeDock)
  └─ Migrate all sidebar content to new locations
```

---

## MVP Recommendation

**What to build in v1.4:**

### Phase 1: Critical Path (Foundation)

1. **Persistent Status Bar** (3-4 hours)
   - Extract donut + counts from sidebar ProgressRingCard
   - Add to AppBar with: donut (48px) + "N passed, M failed, K skipped" (text) + date + env
   - Ensure sticky/fixed positioning so always visible when scrolling
   - Complexity: **Low** | Rationale: Enables removing sidebar. Reuses existing components

2. **Modal Test Details** (2-3 hours)
   - Replace isDockOpen/closeDock drawer logic with Dialog(Modal)
   - Move TestDetails content into Dialog body
   - Add Escape key support (Dialog handles this)
   - Add focus trap (Dialog handles this)
   - Update test list click handler: setSelectedTest() → open Modal
   - Complexity: **Low** | Rationale: Better UX. Same content, different pattern

3. **Dropdown Menu Navigation** (2-3 hours)
   - Create NavigationMenu component with IconButton(MenuIcon)
   - Use MUI Menu with MenuItem for each view
   - Show text labels: "Overview", "Tests", "Failure Clusters", "Gallery", "Comparison"
   - Connect to activeView in store
   - Place in AppBar (left side, near title OR right side after filters)
   - Complexity: **Low** | Rationale: Completes sidebar removal. One-click navigation

4. **Inline Test Filters** (2-3 hours)
   - Move TestListFilters from Sidebar to TestList component
   - Create filter bar above virtual test list with status/suite/stability chips
   - Keep all existing filter state and logic
   - Complexity: **Low** | Rationale: Convenience. Reduces modal switching

### Phase 2: Cleanup (Polish)

5. **Remove Sidebar** (1 hour)
   - Delete Sidebar.tsx, SidebarStats.tsx, SidebarFilters.tsx
   - Remove isDockOpen, closeDock from MobX store
   - Update MainLayout to not render Sidebar
   - Remove Drawer anchor/open/onClose props

6. **QA & Accessibility** (2-3 hours)
   - Test modal: Escape closes, Tab traps, focus returns
   - Test menu: visible on desktop, keyboard navigation (Arrow keys, Enter)
   - Test status bar: always visible when scrolling
   - Test filters: state persists after navigation

**Total Effort:** ~12-16 hours of development (LOW complexity, HIGH impact)

---

## Deferred Features

| Feature | Why Defer | Target |
|---------|-----------|--------|
| **Mobile responsive hamburger drawer** | Hamburger as side drawer is correct for mobile, but current priority is desktop. Modal may not have enough space on small screens for test details | v1.5+ (Mobile Responsive) |
| **Keyboard shortcuts (j/k, 1-5 for views)** | Power-user feature. Core nav (menu) covers this. Shortcuts are nice-to-have | v1.5+ (Keyboard Navigation) |
| **Accessibility audit (WCAG 2.2)** | Modal and menu need thorough testing: role="dialog", aria-modal="true", focus-trap, Escape key, label associations | Before v1.4 GA (QA phase) |
| **Animation/transitions on modal open** | Nice polish but not critical. Dialog component works without | v1.4.1+ (Polish) |

---

## Complexity Assessment

| Feature | Hours | Risk | Implementation Notes |
|---------|-------|------|----------------------|
| **Persistent Status Bar** | 3-4 | Low | Reuse ProgressRingCard; redesign AppBar layout with flexbox/grid |
| **Modal Test Details** | 2-3 | Low | Swap Drawer → Dialog; MUI handles focus/Escape |
| **Dropdown Menu** | 2-3 | Low | MUI Menu is battle-tested; simple state management |
| **Inline Filters** | 2-3 | Low | Move component; adjust TestList layout |
| **Remove Sidebar** | 1 | Low | Delete files; update imports; remove store props |
| **Total v1.4** | 12-16 | Low | All features straightforward. No new dependencies |

---

## Design Principles for v1.4

1. **Always-visible context** — Pass rate, run status, and metadata visible in every view (persistent AppBar)
2. **Modeless navigation** — Use Menu (dropdown, not modal) for navigation decisions
3. **Modal for secondary info** — Test details, settings, and secondary forms live in modals
4. **Reduce friction** — Filters always accessible inline. No drawer/sidebar/modal context switches needed
5. **Single source of truth** — One navigation entry point (Menu). One filter location (test list header). One detail view (Modal)
6. **Desktop-first visibility** — Visible text labels in menu (not hamburger-only icon)

---

## Competing Patterns & Why v1.4 Chosen

### Navigation Pattern: Menu vs Hamburger Sidebar Drawer

| Pattern | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Visible Sidebar (v1.2/1.3)** | Always accessible; users see all options | Consumes 250-400px screen width; reduces content area; complex to remove | ✓ Current, but v1.4 replaces |
| **Hidden Hamburger Drawer (mobile pattern)** | Saves space on mobile | 39% slower task completion on desktop; 50% discoverability loss (NN/G). Users expect to see navigation | ✗ Antipattern on desktop |
| **Dropdown Menu with Text Labels (v1.4)** | Compact when closed (just icon); visible text labels when open; shows options clearly; follows Material Design | Takes up AppBar space; requires users to click to see options | ✓ **RECOMMENDED for v1.4** |
| **Top Tab Navigation** | Visible; standard for 3-5 views | Only works for <5 items; Qase has 5 views exactly, but tabs are more rigid | ✗ Less flexible than menu |

**Verdict:** Dropdown Menu with text labels is the sweet spot for v1.4. It avoids the discoverability penalty of hamburger-only while still being compact.

### Detail View Pattern: Drawer vs Modal vs Page

| Pattern | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Right Drawer (v1.3)** | Smooth side slide; preserves test list context | Consumes 40vw width; feels like permanent panel; harder to dismiss | ✓ Current |
| **Modal/Dialog (v1.4)** | Overlay; dismissible; doesn't consume permanent space; focus-trapped; Escape key | Takes focus; blocks main content | ✓ **RECOMMENDED for v1.4** |
| **Page Navigation** | Full screen; lots of space | Page transition; breaks context; users lose test list scroll position | ✗ No |
| **Popover/Popointer** | Lightweight; dismissible | No scroll; limited space for test details (steps, attachments) | ✗ Too small |

**Verdict:** Modal is better for secondary details because it doesn't consume permanent space (unlike drawer) and maintains better focus semantics (unlike page nav).

---

## UX Flow: How v1.4 Works

### Loading a Report (No changes from v1.3)

```
User opens Qase Report
→ Sees AppBar with:
   - Logo + "Qase Report"
   - Menu button (three lines) in center-left
   - Search (⌘K) on right
   - Export on right
   - Theme toggle on right
→ Sees Persistent Status Bar showing "87% passed (N tests)"
→ Sees main content area (empty or with loaded report)
```

### Navigating Views (NEW with v1.4)

```
User clicks Menu button (hamburger icon)
→ Menu opens showing:
   [ ] Overview
   [ ] Tests
   [ ] Failure Clusters
   [ ] Gallery
   [ ] Comparison
User clicks "Tests"
→ Menu closes
→ Main content switches to Tests view
→ Tests list renders with inline filters at top
→ Status bar still shows pass rate, metadata
```

### Filtering Tests (NEW with v1.4)

```
User sees test list with filter bar at top:
[Status: All ▼] [Suite: All ▼] [Stability: All ▼]
User clicks "Status: All"
→ Dropdown shows: All, Passed, Failed, Skipped
User selects "Failed"
→ Test list filters to failed tests only
→ Filter state persists in MobX store
```

### Viewing Test Details (NEW with v1.4)

```
User clicks on a test in the list
→ Modal dialog opens with TestDetails content
→ Modal shows:
   - Test name (header)
   - Error message (if failed)
   - Parameters
   - Custom fields
   - Attachments (images, logs)
   - Steps with nesting
   - Close button (X) in header
User presses Escape or clicks X
→ Modal closes
→ Focus returns to the test item clicked
→ User can click another test to open a new modal
```

---

## Accessibility Requirements (for QA)

| Requirement | How Satisfied | Test Method |
|-------------|---------------|-------------|
| **Dialog modal has role="dialog"** | MUI Dialog component auto-applies | Inspect element; check ARIA attributes |
| **Modal title announced** | Dialog label = "Test Details" | Screen reader test; check `aria-labelledby` |
| **Focus trap inside modal** | MUI Dialog auto-traps Tab key | Tab through modal; verify focus doesn't escape |
| **Escape key closes modal** | MUI Dialog + onClose handler | Press Escape; modal should close |
| **Focus returns on close** | Dialog restoreFocus prop (true by default) | Close modal; check focus returns to trigger button |
| **Menu navigation keyboard** | Menu responds to Arrow Up/Down, Enter, Escape | Keyboard navigate menu without mouse |
| **Status bar always visible** | AppBar position: sticky (not fixed) | Scroll page; verify donut + counts don't disappear |
| **Filter chips have labels** | Chip components include text (not just icons) | Screen reader reads chip text aloud |

---

## Sources

### Navigation & Hamburger Menu Patterns
- [NN/G: Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/) — **Key finding:** Hamburger menus reduce discoverability 50% on desktop, increase task time 39%; better alternatives exist
- [Material-UI: React Menu component](https://mui.com/material-ui/react-menu/) — Dropdown menu implementation, controlled component pattern
- [David Mohr: Creating Hamburger Menu with React and MUI 5](https://david-mohr.com/blog/react-hamburger-menu-navigation) — Practical implementation patterns

### Modal vs Drawer
- [Medium: Modal vs Drawer — When to use the right component](https://medium.com/@ninad.kotasthane/modal-vs-drawer-when-to-use-the-right-component-af0a76b952da) — UX patterns; modals for secondary info, drawers for persistent panels
- [UX Patterns: Modal vs Drawer vs Popover guide](https://uxpatterns.dev/pattern-guide/modal-vs-popover-guide) — When to use each overlay pattern

### Accessibility
- [W3C ARIA: Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — Official accessibility requirements: role="dialog", aria-modal="true", focus trap, Escape key
- [Atomic Accessibility: Accessible Dialog/Modal 2026](https://www.atomica11y.com/accessible-web/dialog-modal/) — WCAG 2.2 compliance checklist
- [Yoast: Making modals accessible](https://yoast.com/developer-blog/the-a11y-monthly-making-modals-accessible/) — Focus management, keyboard navigation

### Test Reporting UI Patterns
- [Allure Report Documentation](https://allurereport.org/docs/) — Modern test report structure; sidebar navigation + persistent stats
- [ReportPortal: Overall Statistics Widget](https://reportportal.io/docs/dashboards-and-widgets/OverallStatistics/) — Persistent statistics display patterns in enterprise reporters
- [Playwright Test Report Guide 2026](https://www.browserstack.com/guide/playwright-test-report) — Modern test reporter UI conventions

### Sticky/Persistent Headers
- [CSS-Tricks: Persistent Headers](https://css-tricks.com/persistent-headers/) — CSS implementation for sticky headers
- [Smashing Magazine: Designing Sticky Menus UX Guidelines](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/) — When and how to use sticky positioning

---

*Last updated: 2026-02-11 after research phase for v1.4 Layout Simplification*
