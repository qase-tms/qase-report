# Architecture Patterns: Layout Simplification

**Project:** Qase Report v1.4
**Domain:** React 18 + TypeScript + MobX + MUI layout refactoring
**Researched:** 2026-02-11
**Scope:** Hamburger menu, modal test details, persistent status bar integration

## Executive Summary

The v1.4 layout simplification involves four architecture changes that must integrate seamlessly:

1. **Sidebar removal** — NavigationDrawer eliminated, navigation moved to AppBar hamburger menu
2. **Hamburger dropdown menu** — New Menu component in AppBar manages view navigation
3. **Modal test details** — TestDetails promoted from Sidebar drawer to Modal/Dialog, triggered from TestList
4. **Persistent status bar** — Pass rate donut chart + run info moved to AppBar, always visible

The existing MobX architecture (RootStore, observer components, activeView state) needs **minimal changes** because:
- activeView state already controls view switching
- selectedTestId + isDockOpen already manage test selection
- Sidebar is just a container—removal doesn't break state flow
- TestDetails is already an observer component that reads selectedTest

**Key insight:** The architecture change is **structural (layout)** not **semantic (state)**. We're reorganizing where components render, not how they coordinate.

---

## Current Architecture Analysis

### State Management (RootStore)

The RootStore manages:

```typescript
// Navigation
activeView: 'dashboard' | 'tests' | 'analytics' | 'failure-clusters' | 'gallery' | 'comparison'
setActiveView(view)

// Test selection (triggers dock/sidebar)
selectedTestId: string | null
isDockOpen: boolean
selectTest(testId)
clearSelection()

// Child stores
reportStore: ReportStore       // Run data, stats
testResultsStore: TestResultsStore // Tests, filtering
analyticsStore: AnalyticsStore     // Flakiness, stability
historyStore: HistoryStore         // Trends, regression
```

**State derivations:**
- `selectedTest` — getter that returns selectedTestId from testResultsStore
- All stores use `makeAutoObservable()` — automatic reactivity

### Current Layout Flow

```
App.tsx (Flex container)
├── AppBar (fixed top)
│   ├── Title
│   ├── RunDateDisplay (center)
│   └── Actions (search, export, theme)
├── NavigationDrawer (permanent left sidebar)
│   ├── SidebarStats (pass rate ring, quick stats)
│   ├── SidebarFilters (status, grade chips)
│   └── Navigation items (6 views)
└── Main (flex: 1)
    └── MainLayout
        ├── LoadReportButton
        ├── Active view (Dashboard, Tests, FailureClusters, etc.)
        └── Sidebar (right drawer, hidden by default)
            └── TestDetails (shows when isDockOpen=true)
```

**Key property:** NavigationDrawer is `variant="permanent"` (always visible, takes 240px expanded or 64px collapsed).

### Current TestDetails Flow

1. User clicks test in TestList → `selectTest(testId)` in RootStore
2. selectTest() sets `selectedTestId` and calls `openDock()` (sets isDockOpen=true)
3. MainLayout observes `isDockOpen` → renders right Sidebar
4. Sidebar renders TestDetails component
5. TestDetails reads `selectedTest` (getter that looks up selectedTestId)
6. TestDetails shows close button → calls `clearSelection()` → isDockOpen=false → drawer closes

**Data flow:** TestList → selectTest() → RootStore → MainLayout observer → Sidebar visibility → TestDetails

---

## Recommended Architecture for v1.4

### 1. Remove NavigationDrawer from App.tsx

**Current:**
```tsx
<App.tsx>
  <AppBar />
  <NavigationDrawer />  ← DELETE THIS
  <Box component="main">
    <MainLayout />
  </Box>
</App.tsx>
```

**After:**
```tsx
<App.tsx>
  <AppBar />
  <Box component="main">
    <MainLayout />
  </Box>
</App.tsx>
```

**Why:** NavigationDrawer's responsibilities move to:
- Navigation → AppBar hamburger Menu
- SidebarStats → AppBar (persistent status display)
- SidebarFilters → TestList (where filtering is applied)

### 2. Create HamburgerMenu Component

**Location:** `src/components/HamburgerMenu/index.tsx`

**Responsibilities:**
- Renders hamburger icon in AppBar
- Handles Menu open/close state (local React state, not MobX)
- Reads `activeView` from RootStore
- Calls `setActiveView(view)` on click
- Displays menu items: Dashboard, Tests, Failure Clusters, Gallery, Comparison, Analytics

**Integration with RootStore:**
```tsx
const HamburgerMenu = () => {
  const { activeView, setActiveView } = useRootStore()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleClick = (view) => {
    setActiveView(view)
    setAnchorEl(null) // Close menu
  }

  return (
    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
      <MenuIcon />
    </IconButton>
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={() => setAnchorEl(null)}
    >
      {navItems.map(item => (
        <MenuItem
          key={item.id}
          selected={activeView === item.id}
          onClick={() => handleClick(item.id)}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  )
}
```

**State:** Menu state (anchorEl) is **local React state**. Navigation state (activeView) lives in **MobX RootStore**.

### 3. Create StatusBarPill Component

**Location:** `src/components/StatusBarPill/index.tsx`

**Responsibilities:**
- Renders compact pass rate donut chart (reuse CircularProgress from SidebarStats)
- Shows quick stats: passed, failed, flaky counts
- Displays run date/title
- Always visible in AppBar

**Integration with RootStore:**
```tsx
const StatusBarPill = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()

  if (!reportStore.runData) return null

  const passRate = reportStore.passRate
  const stats = reportStore.runData.stats

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Pass rate ring (smaller size) */}
      <CircularProgress variant="determinate" value={passRate} size={32} />

      {/* Quick stats */}
      <Box sx={{ display: 'flex', gap: 0.5, fontSize: '0.875rem' }}>
        <span>{stats.passed}✓</span>
        <span>{stats.failed}✕</span>
        <span>{analyticsStore.flakyTestCount}~</span>
      </Box>

      {/* Run info */}
      <Typography variant="caption">{reportStore.runData.title}</Typography>
    </Box>
  )
})
```

**Why observer():** statusBarPill depends on reportStore (reactivity).

### 4. Convert TestDetails to Modal

**Current:** Right drawer (Sidebar component)
**New:** Modal dialog (MUI Dialog component)

**Key difference:**
- Drawer lives in MainLayout, opens when isDockOpen=true
- Modal should be rendered at App.tsx level or in a portal (MUI Dialog handles portal automatically)

**New structure:**
```tsx
<App.tsx>
  <AppBar />
  <MainLayout />
  <TestDetailsModal />  ← New, rendered at App level
</App.tsx>
```

**TestDetailsModal component:**
```tsx
const TestDetailsModal = observer(() => {
  const { isDockOpen, selectedTest, clearSelection } = useRootStore()

  return (
    <Dialog
      open={isDockOpen}
      onClose={clearSelection}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        {selectedTest && <TestDetails />}
      </DialogContent>
    </Dialog>
  )
})
```

**Why Modal over Drawer:**
- Better UX for desktop (modal centers, drawer off-canvas)
- Easier to dismiss (ESC key, backdrop click, close button)
- Modal is more discoverable than right drawer
- Drawer now freed from RootStore architecture

**Backward compatibility:** TestDetails component itself doesn't change. It still reads selectedTest from RootStore.

### 5. Move Filters to TestList View

**Current:** SidebarFilters in NavigationDrawer (left sidebar)
**New:** TestListFilters already in TestList component

**What changes:**
- SidebarFilters component already integrated into TestList (see TestListFilters component)
- No MobX changes needed—filtering logic is already in TestResultsStore
- Visual change: filters move from sidebar to above test list

**Action:** Verify that TestListFilters displays the same controls:
- Status filter (Passed, Failed, Broken, Skipped)
- Stability grade filter (A+, A, B, C, D, F)

### 6. Update MainLayout to Remove Sidebar

**Current:**
```tsx
<Grid container>
  <Grid item xs={12}>
    <LoadReportButton />
    {renderView()}
  </Grid>
  <Sidebar isOpen={isDockOpen} onClose={closeDock}>
    <TestDetails />
  </Sidebar>
  <AttachmentViewer />
</Grid>
```

**After:**
```tsx
<Grid container>
  <Grid item xs={12}>
    <LoadReportButton />
    {renderView()}
  </Grid>
  <AttachmentViewer />
</Grid>
```

The right Sidebar that contains TestDetails is removed entirely.

---

## Component Boundaries

### New Components

| Component | Location | Responsibility | State | Depends On |
|-----------|----------|-----------------|-------|-----------|
| HamburgerMenu | `src/components/HamburgerMenu/` | Menu icon, dropdown nav items | React local (anchorEl) | RootStore (activeView, setActiveView) |
| StatusBarPill | `src/components/StatusBarPill/` | Pass rate donut, quick stats, run info | MobX (observer) | RootStore (reportStore, analyticsStore) |
| TestDetailsModal | `src/components/TestDetailsModal/` | Modal wrapper for TestDetails | MobX (observer) | RootStore (isDockOpen, selectedTest, clearSelection) |

### Modified Components

| Component | Change | Rationale |
|-----------|--------|-----------|
| App.tsx | Add HamburgerMenu, StatusBarPill to AppBar; Add TestDetailsModal at root; Remove NavigationDrawer | Restructure layout |
| AppBar | Replace Actions area with HamburgerMenu + StatusBarPill + existing buttons | New top bar structure |
| MainLayout | Remove Sidebar with TestDetails | Modal now at App level |
| TestList | Ensure TestListFilters visible | Filters already integrated |

### Removed Components

| Component | Reason | Content Moved To |
|-----------|--------|------------------|
| NavigationDrawer | Sidebar eliminated | HamburgerMenu (nav), StatusBarPill (stats) |
| SidebarStats | Integrated into StatusBarPill | AppBar (compact version) |
| SidebarFilters | Integrated into TestList | TestListFilters (already exists) |
| Sidebar (right drawer) | Replaced by Modal | TestDetailsModal |

---

## Data Flow Diagrams

### Navigation Flow (Unchanged at MobX Level)

```
HamburgerMenu (clicked)
  ↓
setActiveView(view)  ← RootStore method
  ↓
activeView = view  ← Observable
  ↓
MainLayout observer triggers
  ↓
renderView() returns appropriate component
```

### Test Selection Flow (Unchanged)

```
TestListItem (clicked)
  ↓
selectTest(testId)  ← RootStore method
  ↓
selectedTestId = testId  ← Observable
isDockOpen = true
  ↓
TestDetailsModal observer triggers
  ↓
Dialog opens (open={isDockOpen})
  ↓
TestDetails reads selectedTest (getter)
```

### Test Details Modal Close Flow

```
TestDetails close button (clicked)
  ↓
clearSelection()  ← RootStore method
  ↓
selectedTestId = null  ← Observable
isDockOpen = false
  ↓
TestDetailsModal observer triggers
  ↓
Dialog closes (open={isDockOpen})
```

---

## Architectural Patterns to Follow

### Pattern 1: Observer-Based Reactive UI

**What:** Components wrap with `observer()` from mobx-react-lite when they read observable RootStore properties.

**When:**
- Component reads RootStore directly (useRootStore())
- Component must re-render when store properties change

**Example:**
```tsx
export const StatusBarPill = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()
  // Automatically re-renders when reportStore.runData or analyticsStore changes
  return <Box>...</Box>
})
```

### Pattern 2: Local State for UI Toggles

**What:** Menu open/close state lives in React component state, not MobX.

**When:**
- State is ephemeral (user interaction)
- State doesn't need to persist or affect other components
- State is UI chrome, not domain state

**Example:**
```tsx
const HamburgerMenu = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  // Menu state is React local, not MobX
  // Navigation state (activeView) is MobX
}
```

### Pattern 3: Container Components (Layouts) at Root

**What:** Modal and layout containers render at App level, not nested deep.

**When:**
- Component needs to be visually above other content (modal, portal)
- Component manages major UI state (layouts, drawer visibility)

**Example:** TestDetailsModal at App.tsx level, not nested in MainLayout.

### Pattern 4: Controlled Components with RootStore

**What:** Components call RootStore methods to update state, don't manage it locally.

**When:**
- State must be shared across multiple components
- State should persist across navigation
- State changes should trigger side effects

**Example:**
```tsx
selectTest(testId) {
  this.selectedTestId = testId
  this.openDock()
}
```

---

## Integration Points

### 1. AppBar Restructuring

**Current:**
```tsx
<Toolbar>
  <Title />
  <RunDateDisplay /> (center)
  <Actions: Search, Export, Theme />
</Toolbar>
```

**New:**
```tsx
<Toolbar>
  <HamburgerMenu />  ← NEW
  <Title />
  <StatusBarPill />  ← NEW (replaces RunDateDisplay)
  <Actions: Search, Export, Theme />
</Toolbar>
```

**Implementation notes:**
- HamburgerMenu on far left after title
- StatusBarPill in center (was RunDateDisplay)
- RunDateDisplay content absorbed into StatusBarPill
- Toolbar spacing may need adjustment (more items now)

### 2. RootStore Methods Unchanged

No new methods needed. Existing methods sufficient:
- `setActiveView(view)` — called by HamburgerMenu
- `selectTest(testId)` — already called by TestList
- `clearSelection()` — already called by TestDetails close button

### 3. TestList Component

**Already has:**
- TestListFilters (status, grade)
- TestListSearch (search box)
- VirtualizedTestList (renders tests, calls selectTest on click)

**No changes needed** — just verify filters visible in new layout.

### 4. No TestResultsStore Changes

Filtering logic already exists:
- `statusFilters` — Set of statuses to show
- `stabilityGradeFilters` — Set of grades to show
- `filteredResults` — Computed property (getter)
- `toggleStatusFilter()` — Method
- `toggleStabilityGradeFilter()` — Method

Filters move from SidebarFilters → TestListFilters, logic unchanged.

---

## Scalability Considerations

| Concern | Current | At 10K users | At 1M users | Notes |
|---------|---------|--------------|-------------|-------|
| Menu dropdown size | 6 items | 6 items | 6 items | Navigation fixed, no scaling issue |
| Status bar data flow | observer, reactive | observer, reactive | observer, reactive | Stats calculated once per reportStore load |
| Modal performance | N/A | Light modal, cached TestDetails | Light modal, cached TestDetails | Modal reuse pattern, no perf impact |
| Test selection state | Map<id, test> | O(1) lookup | O(1) lookup | MobX batches updates, no perf regression |

**Scaling bottleneck:** Not layout, but TestList rendering. Virtual scrolling handles this (existing).

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Moving Navigation State to React Local State

**What:** Storing activeView in useState instead of RootStore
```tsx
// ✗ BAD
const [activeView, setActiveView] = useState('dashboard')
```

**Why bad:**
- Navigation state resets on component re-render
- Multiple components can't share view state
- Deep nesting needed to pass state down

**Instead:** Keep activeView in RootStore (already correct).

### Anti-Pattern 2: Making TestDetailsModal a Controlled Component with Modal Props

**What:** Passing isOpen/onClose as props from App to Modal
```tsx
// ✗ RISKY
<TestDetailsModal open={isDockOpen} onClose={clearSelection} />
```

**Why bad:**
- Coupling between App and TestDetailsModal
- Modal should read its own open state from RootStore
- If TestDetailsModal needs to be reused elsewhere, props don't transfer

**Instead:** Let TestDetailsModal observer read isDockOpen directly.
```tsx
// ✓ GOOD
const TestDetailsModal = observer(() => {
  const { isDockOpen, clearSelection } = useRootStore()
  return <Dialog open={isDockOpen} onClose={clearSelection} />
})
```

### Anti-Pattern 3: Duplicating Filter State Between Sidebar and TestList

**What:** Having SidebarFilters AND TestListFilters both manage filters
```tsx
// ✗ BAD - two sources of truth
<NavigationDrawer>
  <SidebarFilters />
</NavigationDrawer>
<MainLayout>
  <TestList>
    <TestListFilters />
  </TestList>
</MainLayout>
```

**Why bad:**
- User changes filter in sidebar, doesn't affect list
- Two UI representations of same state
- Confusion about which is authoritative

**Instead:** Single source (TestResultsStore), single UI (TestListFilters in TestList).

### Anti-Pattern 4: Reading RootStore in Layout Components Without observer()

**What:** Accessing store without making component reactive
```tsx
// ✗ BAD - won't react to store changes
const MainLayout = () => {
  const { activeView } = useRootStore()
  // If activeView changes, MainLayout doesn't re-render
  return renderView()
}
```

**Why bad:**
- View doesn't switch when activeView changes
- Store updates are ignored

**Instead:** Always wrap with observer():
```tsx
// ✓ GOOD
export const MainLayout = observer(() => {
  const { activeView } = useRootStore()
  return renderView()
})
```

---

## Testing Strategy

### Unit Tests

| Component | What to Test | Notes |
|-----------|--------------|-------|
| HamburgerMenu | Menu opens/closes, item click calls setActiveView | Mock RootStore |
| StatusBarPill | Renders stats when report loaded, hides when none | Mock reportStore |
| TestDetailsModal | Opens when isDockOpen=true, closes on clearSelection | Mock RootStore |

### Integration Tests

| Flow | What to Test |
|------|--------------|
| Navigation | Click hamburger item → activeView changes → view renders |
| Test selection | Click test → isDockOpen=true → modal opens → shows test details |
| Modal close | Click close button → clearSelection() → isDockOpen=false → modal closes |

### E2E Tests

| Scenario | Steps | Assertion |
|----------|-------|-----------|
| Load report and browse | Load → navigate views via hamburger → select test → modal opens | Modal displays correct test |
| Filter and select | Load → apply filters → select filtered test → modal shows test | Test shown in modal |
| Status persistence | Navigate views, status bar always visible | Status bar never hidden |

---

## Build Order Recommendations

### Phase 1: Foundation (Low risk)

1. **Create HamburgerMenu component**
   - Render in AppBar (doesn't affect layout yet)
   - Wire up setActiveView calls
   - Test menu appears and navigation works
   - **Risk:** Low—additive change, AppBar grows horizontally

2. **Create StatusBarPill component**
   - Render in AppBar center
   - Display pass rate, quick stats
   - Test with report loaded and empty states
   - **Risk:** Low—additive change, visual only

### Phase 2: Structural (Medium risk)

3. **Create TestDetailsModal component**
   - Render at App level alongside MainLayout
   - Wrap TestDetails component
   - Connect isDockOpen state from RootStore
   - **Risk:** Medium—modal replaces drawer UX, needs testing

4. **Remove Sidebar from MainLayout**
   - Delete Sidebar component usage in MainLayout
   - TestDetails now only used in TestDetailsModal
   - **Risk:** Medium—removes component, must verify modal works

### Phase 3: Cleanup (Low risk)

5. **Remove NavigationDrawer from App**
   - Delete NavigationDrawer component usage
   - Delete NavigationDrawer component file
   - **Risk:** Low—component no longer used

6. **Delete obsolete components**
   - Remove Sidebar component (now unused)
   - Remove NavigationDrawer component (now unused)
   - Remove SidebarStats component (logic moved to StatusBarPill)
   - **Risk:** Low—cleanup, no functional impact

7. **Verify TestList filters**
   - Confirm TestListFilters displays all controls
   - Test filter state persists across navigation
   - **Risk:** Low—filters already integrated

---

## Migration Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Modal UX different from drawer | Medium | User testing, ensure ESC dismisses modal, backdrop clickable |
| AppBar becomes crowded | Low | Icons only for HamburgerMenu, compact StatusBarPill, scroll if needed |
| Test selection lost on navigation | Low | selectedTestId persists in RootStore, modal stays open during nav |
| Filters hidden in TestList | Low | Verify TestListFilters visible by default, not collapsed |
| Performance regression | Low | No new rendering, observer pattern unchanged, virtual scrolling unchanged |

---

## MobX State Dependency Map

```
RootStore
├── activeView (used by: MainLayout, HamburgerMenu)
├── isDockOpen (used by: TestDetailsModal)
├── selectedTestId (used by: TestDetails via selectedTest getter)
├── reportStore
│   └── runData (used by: StatusBarPill, Dashboard, MainLayout)
├── testResultsStore
│   ├── filteredResults (used by: TestList)
│   ├── statusFilters (used by: TestListFilters)
│   └── stabilityGradeFilters (used by: TestListFilters)
├── analyticsStore
│   └── flakyTestCount (used by: StatusBarPill, SidebarStats)
└── attachmentViewerStore (used by: AttachmentViewer)
```

**No new dependencies added.** All state reads already exist; just moved between components.

---

## Files to Modify/Create

### Create New

```
src/components/HamburgerMenu/
  ├── index.tsx (50-80 LOC)
  └── HamburgerMenu.test.tsx (optional)

src/components/StatusBarPill/
  ├── index.tsx (60-100 LOC)
  └── StatusBarPill.test.tsx (optional)

src/components/TestDetailsModal/
  ├── index.tsx (40-60 LOC)
  └── TestDetailsModal.test.tsx (optional)
```

### Modify

```
src/App.tsx
  - Import HamburgerMenu, StatusBarPill, TestDetailsModal
  - Remove NavigationDrawer
  - Add HamburgerMenu to AppBar
  - Add StatusBarPill to AppBar
  - Add TestDetailsModal at root level
  ~ 15-25 lines changed

src/components/AppBar/index.tsx (if exists) or App.tsx Toolbar
  - Restructure toolbar layout
  - Add new components
  ~ 10-15 lines changed

src/layout/MainLayout/index.tsx
  - Remove Sidebar component and import
  - Simplify Grid to single column
  ~ 10 lines removed
```

### Delete

```
src/components/NavigationDrawer/index.tsx
src/components/SidebarStats/index.tsx  (if not reused)
src/components/Sidebar/index.tsx (if only used for TestDetails)
```

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| MobX state architecture | HIGH | Existing codebase reviewed, no new patterns needed |
| Component integration | HIGH | Clear dependencies, observer pattern proven in codebase |
| Modal vs Drawer UX | MEDIUM | Requires user testing, but technical implementation straightforward |
| Filter relocation | HIGH | TestListFilters already integrated, no logic changes |
| No performance impact | HIGH | Virtual scrolling, caching unchanged, observer batching intact |

---

## Sources

- Codebase review: RootStore, MainLayout, App, NavigationDrawer, TestDetails, TestList
- MobX documentation: observer pattern, makeAutoObservable
- MUI documentation: Menu, Dialog, AppBar, Toolbar
- Project context: .planning/PROJECT.md v1.4 requirements
