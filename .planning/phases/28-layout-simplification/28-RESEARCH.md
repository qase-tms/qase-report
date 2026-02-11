# Phase 28: Layout Simplification - Research

**Researched:** 2026-02-11
**Domain:** UI layout refactoring, component removal, state cleanup
**Confidence:** HIGH

## Summary

Phase 28 focuses on removing the permanent sidebar (NavigationDrawer) from the layout while ensuring filters remain accessible from the test list view. The architecture is already well-prepared for this change:

1. **Filter state is correctly owned by TestResultsStore** - no orphaned state risk
2. **Filters are already duplicated in TestList** - TestListFilters.tsx and StabilityGradeFilter.tsx exist
3. **Navigation exists in hamburger menu** - App.tsx already has a complete Menu component
4. **Stats displayed in AppBar** - StatusBarPill shows all key metrics

The main work is removing components, not building new ones. The risk of "orphaned filter state" (mentioned in STATE.md) does not exist - filter state lives in TestResultsStore, not in sidebar components.

**Primary recommendation:** Remove NavigationDrawer and its dependent components (SidebarFilters, SidebarStats, Sidebar). Clean up unused RootStore state (isNavigationCollapsed, isDockOpen, toggleNavigation). Existing TestListFilters in the test list view already provides full filter functionality.

## Current Architecture Analysis

### Filter State Location (TestResultsStore)

Filter state is correctly centralized in `src/store/TestResultsStore.ts`:

```typescript
// Lines 21-23
searchQuery = ''
statusFilters = new Set<string>()
stabilityGradeFilters = new Set<StabilityGrade>()
```

**Methods for filter manipulation:**
- `setSearchQuery(query: string)` - line 145
- `toggleStatusFilter(status: string)` - line 153
- `toggleStabilityGradeFilter(grade: StabilityGrade)` - line 165
- `clearFilters()` - line 176

**Computed property for filtered results:**
- `filteredResults` - line 97 (combines status, search, and stability grade filters)

This is the single source of truth. Both SidebarFilters and TestListFilters consume the same store.

### Components to Remove

| Component | Path | Used By | Safe to Remove |
|-----------|------|---------|----------------|
| NavigationDrawer | `src/components/NavigationDrawer/` | App.tsx | YES - hamburger menu exists |
| SidebarFilters | `src/components/SidebarFilters/` | NavigationDrawer | YES - TestListFilters exists |
| SidebarStats | `src/components/SidebarStats/` | NavigationDrawer | YES - StatusBarPill exists |
| Sidebar | `src/components/Sidebar/` | Not used (orphan) | YES - legacy component |

### Store State to Clean Up

RootStore has navigation-related state that becomes unnecessary:

```typescript
// src/store/index.tsx
isDockOpen = false           // Line 20 - not used after Phase 27
isNavigationCollapsed = false // Line 24 - no longer needed
toggleNavigation = () => {}   // Line 57-62 - no longer needed
openDock/closeDock           // Lines 47-51 - not used after Phase 27
```

**Note:** `activeView` and `setActiveView` must be preserved - hamburger menu uses them.

### Filter Components Already in TestList

The test list view already has complete filter functionality:

**TestListFilters.tsx (src/components/TestList/TestListFilters.tsx):**
- Status filter chips (passed, failed, broken, skipped)
- Integrates StabilityGradeFilter component

**StabilityGradeFilter.tsx (src/components/TestList/StabilityGradeFilter.tsx):**
- Grade filter chips (A+, A, B, C, D, F)

**TestListSearch.tsx (src/components/TestList/TestListSearch.tsx):**
- Search input with debounce (300ms)

These components are used in TestList/index.tsx and work correctly now.

## Architecture Patterns

### Before (Current State)

```
App.tsx
├── AppBar
│   ├── Hamburger Menu (navigation - duplicate of NavigationDrawer)
│   └── StatusBarPill (stats - duplicate of SidebarStats)
├── NavigationDrawer (permanent drawer)
│   ├── SidebarStats
│   ├── Navigation items
│   └── SidebarFilters
└── MainLayout
    └── TestList
        ├── TestListSearch
        └── TestListFilters (filters - duplicate of SidebarFilters)
```

### After (Target State)

```
App.tsx
├── AppBar
│   ├── Hamburger Menu (navigation - sole location)
│   └── StatusBarPill (stats - sole location)
└── MainLayout (full width - no drawer offset)
    └── TestList
        ├── TestListSearch
        └── TestListFilters (filters - sole location)
```

### Removal Sequence

1. Remove NavigationDrawer import and usage from App.tsx
2. Remove Box margin-left that compensates for drawer width
3. Delete NavigationDrawer, SidebarFilters, SidebarStats, Sidebar directories
4. Clean up RootStore (remove isNavigationCollapsed, isDockOpen, toggleNavigation, openDock, closeDock)
5. Remove localStorage access for 'navigationCollapsed'

## Don't Hand-Roll

| Problem | Don't Build | Already Exists | Location |
|---------|-------------|----------------|----------|
| Status filters | Custom filter component | TestListFilters | src/components/TestList/TestListFilters.tsx |
| Stability grade filters | Custom filter component | StabilityGradeFilter | src/components/TestList/StabilityGradeFilter.tsx |
| Search | Custom search | TestListSearch | src/components/TestList/TestListSearch.tsx |
| Navigation | New nav component | Hamburger Menu | App.tsx lines 89-169 |
| Stats display | Stats component | StatusBarPill | src/components/StatusBarPill/ |

**Key insight:** This phase is pure deletion - all needed functionality already exists in duplicate. The task is to remove the sidebar copy, not to migrate functionality.

## Common Pitfalls

### Pitfall 1: Forgetting Layout Compensation
**What goes wrong:** After removing NavigationDrawer, main content still has margin-left
**Why it happens:** Box component in App.tsx may have drawer-width compensation
**How to avoid:** Check App.tsx Box component sx prop after removing drawer
**Warning signs:** Large empty space on left side of viewport

### Pitfall 2: Breaking Navigation State
**What goes wrong:** activeView and setActiveView removed during cleanup
**Why it happens:** Overzealous cleanup of "navigation" related code
**How to avoid:** Keep activeView/setActiveView in RootStore - hamburger menu needs them
**Warning signs:** Menu clicks do nothing, TypeScript errors on setActiveView

### Pitfall 3: Missing localStorage Cleanup
**What goes wrong:** localStorage 'navigationCollapsed' persists after feature removal
**Why it happens:** localStorage.setItem removed but getItem still runs on init
**How to avoid:** Remove both the setter (toggleNavigation) and getter (constructor localStorage access)
**Warning signs:** Console warnings about failed JSON.parse

### Pitfall 4: Forgetting Component Directory Deletion
**What goes wrong:** Orphan components remain in codebase
**Why it happens:** Only removing imports, not deleting directories
**How to avoid:** Delete entire directories: NavigationDrawer, SidebarFilters, SidebarStats, Sidebar
**Warning signs:** git status shows undeleted files

## Code Examples

### Current App.tsx Structure to Modify

```typescript
// src/App.tsx - REMOVE these imports
import { NavigationDrawer } from './components/NavigationDrawer'

// REMOVE from render (line 171)
<NavigationDrawer />
```

### Current RootStore State to Remove

```typescript
// src/store/index.tsx - REMOVE these
isDockOpen = false                    // Line 20
isNavigationCollapsed = false         // Line 24
openDock = () => (this.isDockOpen = true)  // Line 47
closeDock = () => { ... }             // Lines 48-51
toggleNavigation = () => { ... }      // Lines 57-62

// REMOVE localStorage access in constructor (lines 37-44)
const stored = localStorage.getItem('navigationCollapsed')
// ... JSON.parse logic
```

### State That MUST Remain

```typescript
// src/store/index.tsx - KEEP these
activeView: 'dashboard' | 'tests' | 'analytics' | 'failure-clusters' | 'gallery' | 'comparison' = 'dashboard'
setActiveView = (view: ...) => { this.activeView = view }
selectedTestId: string | null = null
selectedTest: QaseTestResult | null  // getter
selectTest = (testId: string) => { ... }
clearSelection = () => { ... }
```

### Filter Persistence Verification

Filters already persist during navigation because:
1. TestResultsStore is instantiated once (singleton via RootStore)
2. Filter state (statusFilters, stabilityGradeFilters, searchQuery) is in store, not component state
3. Changing activeView does not unmount/remount the store

```typescript
// This pattern in TestListFilters ensures persistence:
const { testResultsStore } = useRootStore()  // Same store instance every time
const { statusFilters, toggleStatusFilter } = testResultsStore
```

## Verification Checklist

Post-implementation verification:

1. **LAY-01 (Sidebar removed):**
   - NavigationDrawer not in DOM (inspect element)
   - No permanent drawer visible on left side
   - Full viewport width available for content

2. **LAY-02 (Filters in test list):**
   - Status chips visible in test list view
   - Stability grade chips visible in test list view
   - Filters affect test list (clicking "Failed" shows only failed tests)

3. **Filter persistence:**
   - Apply filter on dashboard view
   - Navigate to tests view via hamburger menu
   - Filter still applied (same filtered results)
   - Navigate back to dashboard
   - Filter still applied

4. **Navigation works:**
   - Hamburger menu opens on click
   - All menu items clickable
   - View changes on menu item click
   - Menu closes after selection

5. **No orphan code:**
   - `grep -r "NavigationDrawer" src/` returns nothing
   - `grep -r "SidebarFilters" src/` returns nothing
   - `grep -r "SidebarStats" src/` returns nothing
   - `grep -r "isNavigationCollapsed" src/` returns nothing
   - `grep -r "isDockOpen" src/` returns nothing

## File Impact Summary

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Remove NavigationDrawer import and usage |
| `src/store/index.tsx` | Remove isDockOpen, isNavigationCollapsed, toggleNavigation, openDock, closeDock, localStorage access |

### Files/Directories to Delete

| Path | Reason |
|------|--------|
| `src/components/NavigationDrawer/` | Replaced by hamburger menu |
| `src/components/SidebarFilters/` | Replaced by TestListFilters |
| `src/components/SidebarStats/` | Replaced by StatusBarPill |
| `src/components/Sidebar/` | Not used (legacy orphan) |

### Files Unchanged

- `src/components/TestList/*` - filters already here, no changes needed
- `src/store/TestResultsStore.ts` - filter state stays here
- `src/components/StatusBarPill/` - already displays stats
- Hamburger menu code in App.tsx - already complete

## Open Questions

None - the architecture is clear and all needed functionality already exists.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `src/store/TestResultsStore.ts` - filter state location verified
- Direct code inspection of `src/store/index.tsx` - navigation state identified
- Direct code inspection of `src/App.tsx` - hamburger menu verified complete
- Direct code inspection of `src/components/TestList/` - filter components verified

### Secondary (MEDIUM confidence)
- STATE.md review - risk assessment from previous phase noted

## Metadata

**Confidence breakdown:**
- Filter state ownership: HIGH - direct code verification
- Components to remove: HIGH - dependency analysis complete
- Store cleanup: HIGH - grep analysis shows all usages
- Persistence: HIGH - MobX singleton pattern understood

**Research date:** 2026-02-11
**Valid until:** Indefinite (pure refactoring, no external dependencies)
