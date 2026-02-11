# Architecture Patterns for v1.2 Design Refresh

**Domain:** Test Report Visualization Dashboard
**Researched:** 2026-02-10
**Overall confidence:** HIGH

## Current Architecture Summary

```
main.tsx
  RootStoreProvider (MobX context)
    App.tsx
      ThemeProvider (MUI - creates theme inline)
        AppBar (fixed position)
        MainLayout (observer)
          Dashboard
            StatsCard x4
            RunInfoCard
            HostInfoCard
            AlertsPanel (conditional)
            TrendsChart (conditional)
            TestHealthWidget (conditional)
            HistoryTimeline (conditional)
          TestList (conditional)
          Sidebar (Drawer - controlled, right anchor)
            TestDetails
          AttachmentViewer (global modal)
```

### Current Stores

| Store | Responsibility | State |
|-------|---------------|-------|
| `RootStore` | Coordination, dock state, test selection | `isDockOpen`, `selectedTestId` |
| `ReportStore` | Run data, loading state | `runData`, `isLoading`, `error` |
| `TestResultsStore` | Test results Map, filtering | `testResults`, `filters`, `searchQuery` |
| `AttachmentsStore` | Attachment file registry | `attachments` Map |
| `AttachmentViewerStore` | Modal state for attachment viewing | `currentAttachment`, `isOpen` |
| `HistoryStore` | Historical runs, test history | `history`, `recentRuns` |
| `AnalyticsStore` | Computed trends, flakiness, alerts | derived from HistoryStore |

## Recommended Architecture Changes

### 1. Theme System Integration

**Decision: MobX UIStore for theme state, ThemeProvider wrapper**

**Rationale:**
- MobX already manages all app state (consistency)
- Static HTML export requires localStorage (no server)
- MUI ThemeProvider expects a theme object, not mode string
- UIStore can coordinate theme creation reactively

**Architecture:**

```
main.tsx
  RootStoreProvider (MobX)
    ThemeWrapper (NEW - observer)
      ThemeProvider (MUI - theme from UIStore)
        App.tsx
          AppBar
          MainLayout
```

**Why NOT React Context for theme:**
- Would introduce second state management system
- RootStore pattern already established
- UIStore can persist to localStorage naturally
- MobX computed makes theme derivation reactive

### 2. UIStore Design

**NEW store: `src/store/UIStore.ts`**

```typescript
export type ThemeMode = 'light' | 'dark' | 'system'
export type ActiveView = 'dashboard' | 'tests' | 'analytics'

export class UIStore {
  themeMode: ThemeMode = 'system'
  sidebarOpen: boolean = true
  activeView: ActiveView = 'dashboard'

  constructor(public root: RootStore) {
    makeAutoObservable(this)
    this.loadFromStorage()
  }

  // Computed: resolves 'system' to actual mode
  get resolvedThemeMode(): 'light' | 'dark' {
    if (this.themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return this.themeMode
  }

  // Computed: MUI theme object
  get muiTheme(): Theme {
    return createTheme({
      palette: {
        mode: this.resolvedThemeMode,
        // custom palette overrides
      }
    })
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode = mode
    this.saveToStorage()
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
    this.saveToStorage()
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('qase-report-ui')
    if (stored) {
      const { themeMode, sidebarOpen } = JSON.parse(stored)
      this.themeMode = themeMode ?? 'system'
      this.sidebarOpen = sidebarOpen ?? true
    }
  }

  private saveToStorage() {
    localStorage.setItem('qase-report-ui', JSON.stringify({
      themeMode: this.themeMode,
      sidebarOpen: this.sidebarOpen
    }))
  }
}
```

**Integration with RootStore:**

```typescript
export class RootStore {
  uiStore: UIStore  // ADD
  reportStore: ReportStore
  // ... existing stores

  constructor() {
    this.uiStore = new UIStore(this)  // ADD - first for theme
    this.reportStore = new ReportStore(this)
    // ...
  }
}
```

### 3. ThemeWrapper Component

**NEW component: `src/components/ThemeWrapper.tsx`**

```typescript
export const ThemeWrapper = observer(({ children }: PropsWithChildren) => {
  const { uiStore } = useRootStore()

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      // Force MobX recomputation when system preference changes
      if (uiStore.themeMode === 'system') {
        // Trigger re-render by accessing computed
        uiStore.resolvedThemeMode
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [uiStore])

  return (
    <ThemeProvider theme={uiStore.muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
})
```

**Why CssBaseline inside ThemeWrapper:**
- Ensures consistent baseline styles
- Adapts to theme mode (dark background in dark mode)
- Single source of truth for theme application

### 4. Sidebar Architecture

**Current:** `Sidebar` is a controlled Drawer in MainLayout, used only for TestDetails.

**Target:** Persistent navigation sidebar (left) + details panel (right).

**Recommended structure:**

```
MainLayout
  NavigationSidebar (NEW - left, persistent)
    NavItems: Dashboard, Tests, Analytics
    ThemeToggle
    Report info
  MainContent (flex: 1)
    Dashboard | TestList | Analytics (based on activeView)
  DetailsSidebar (existing Sidebar, renamed - right, conditional)
    TestDetails
```

**NavigationSidebar component:**

```typescript
interface NavigationSidebarProps {
  open: boolean
  onToggle: () => void
}

export const NavigationSidebar = observer(({ open, onToggle }: NavigationSidebarProps) => {
  const { uiStore, reportStore } = useRootStore()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 64,
          transition: 'width 0.2s',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar /> {/* Spacer for AppBar */}
      <List>
        <NavItem icon={<DashboardIcon />} label="Dashboard" view="dashboard" />
        <NavItem icon={<ListIcon />} label="Tests" view="tests" />
        <NavItem icon={<AnalyticsIcon />} label="Analytics" view="analytics" />
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <ThemeToggle />
      {reportStore.runData && <ReportInfo />}
    </Drawer>
  )
})
```

**Migration path for existing Sidebar:**
1. Rename `Sidebar` to `DetailsSidebar`
2. Keep as-is for TestDetails display
3. Add NavigationSidebar as new component

### 5. Bento Grid Dashboard Architecture

**Current:** Dashboard uses MUI `<Grid>` (Flexbox-based), fixed column layout.

**Target:** CSS Grid-based Bento layout with variable-size cards.

**Why CSS Grid over MUI Grid:**
- MUI Grid does not support row spanning
- Bento layouts require asymmetric cell sizes
- CSS Grid provides `grid-area` for named regions

**Recommended component structure:**

```typescript
// BentoGrid wrapper component
interface BentoGridProps {
  children: ReactNode
  columns?: number
  gap?: number
}

export const BentoGrid = ({ children, columns = 4, gap = 2 }: BentoGridProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gap,
      gridAutoRows: 'minmax(150px, auto)',
    }}
  >
    {children}
  </Box>
)

// BentoCard with span control
interface BentoCardProps {
  children: ReactNode
  colSpan?: number
  rowSpan?: number
}

export const BentoCard = ({ children, colSpan = 1, rowSpan = 1 }: BentoCardProps) => (
  <Card
    sx={{
      gridColumn: `span ${colSpan}`,
      gridRow: `span ${rowSpan}`,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {children}
  </Card>
)
```

**Dashboard refactor:**

```typescript
export const Dashboard = observer(() => {
  // ... existing store access

  return (
    <BentoGrid columns={4}>
      {/* Stats row - 4 small cards */}
      <BentoCard><StatsCard status="passed" ... /></BentoCard>
      <BentoCard><StatsCard status="failed" ... /></BentoCard>
      <BentoCard><StatsCard status="skipped" ... /></BentoCard>
      <BentoCard><StatsCard status="broken" ... /></BentoCard>

      {/* Trend chart - wide */}
      {analyticsStore.hasTrendData && (
        <BentoCard colSpan={3} rowSpan={2}>
          <TrendsChart />
        </BentoCard>
      )}

      {/* Health widget - tall */}
      {historyStore.isHistoryLoaded && (
        <BentoCard rowSpan={2}>
          <TestHealthWidget />
        </BentoCard>
      )}

      {/* Alerts - full width when present */}
      {analyticsStore.hasAlerts && (
        <BentoCard colSpan={4}>
          <AlertsPanel />
        </BentoCard>
      )}

      {/* Run info + Host info */}
      <BentoCard colSpan={2}><RunInfoCard /></BentoCard>
      <BentoCard colSpan={2}><HostInfoCard /></BentoCard>
    </BentoGrid>
  )
})
```

### 6. Data Flow for Theme Changes

```
User clicks theme toggle
  -> UIStore.setThemeMode('dark')
     -> UIStore.themeMode = 'dark'
     -> localStorage updated
     -> MobX notifies observers
        -> UIStore.muiTheme (computed) recalculates
           -> ThemeWrapper re-renders
              -> ThemeProvider receives new theme
                 -> All MUI components update
```

**Key insight:** Theme flows top-down through ThemeProvider, but state lives in MobX. This separation keeps the benefits of both:
- MobX for persistence and reactive updates
- ThemeProvider for MUI component styling

### 7. Component Diagram

```
src/
  main.tsx                    # Entry point
  App.tsx                     # AppBar + MainLayout (MODIFIED)

  store/
    index.tsx                 # RootStore + context (MODIFIED)
    UIStore.ts                # NEW: theme, sidebar, activeView
    ReportStore.ts            # unchanged
    TestResultsStore.ts       # unchanged
    AttachmentsStore.ts       # unchanged
    AttachmentViewerStore.ts  # unchanged
    HistoryStore.ts           # unchanged
    AnalyticsStore.ts         # unchanged

  components/
    ThemeWrapper.tsx          # NEW: observer + ThemeProvider
    BentoGrid/
      index.tsx               # NEW: BentoGrid + BentoCard
    NavigationSidebar/
      index.tsx               # NEW: left navigation
      NavItem.tsx             # NEW: navigation item
      ThemeToggle.tsx         # NEW: theme mode selector
      ReportInfo.tsx          # NEW: compact report summary
    Sidebar/
      index.tsx               # RENAMED: DetailsSidebar
    Dashboard/
      index.tsx               # MODIFIED: use BentoGrid
      StatsCard.tsx           # unchanged (wrapped in BentoCard)
      TrendsChart.tsx         # unchanged
      ... other cards         # unchanged
    TestList/                 # unchanged
    TestDetails/              # unchanged
    AttachmentViewer/         # unchanged
    LoadReportButton/         # unchanged

  layout/
    MainLayout/
      index.tsx               # MODIFIED: NavigationSidebar + views
```

## Integration Points

### Existing Store Integration

| Integration | How | Impact |
|-------------|-----|--------|
| UIStore -> RootStore | Add as first store in constructor | Low |
| UIStore -> localStorage | `loadFromStorage()` on init | None |
| UIStore.muiTheme -> ThemeProvider | Computed property | None |
| UIStore.activeView -> MainLayout | Conditional rendering | Medium |
| UIStore.sidebarOpen -> NavigationSidebar | Width animation | Low |

### RootStore Changes

```diff
export class RootStore {
+ uiStore: UIStore
  reportStore: ReportStore
  testResultsStore: TestResultsStore
  // ...

  constructor() {
+   this.uiStore = new UIStore(this)
    this.reportStore = new ReportStore(this)
    // ...
  }
}
```

### App.tsx Changes

```diff
function App() {
- const theme = createTheme()
  return (
-   <ThemeProvider theme={theme}>
+   <ThemeWrapper>
      <AppBar ... />
      <MainLayout />
-   </ThemeProvider>
+   </ThemeWrapper>
  )
}
```

### MainLayout Changes

```diff
export const MainLayout = observer(() => {
- const { isDockOpen, closeDock, reportStore } = useRootStore()
+ const { isDockOpen, closeDock, reportStore, uiStore } = useRootStore()

  return (
-   <>
-     <Grid container ...>
-       <Grid item xs={10}>
-         <Dashboard />
-         {reportStore.runData && <TestList />}
-       </Grid>
-       <Grid item xs={2}></Grid>
-       <Sidebar ...>
-         <TestDetails />
-       </Sidebar>
-     </Grid>
-   </>
+   <Box sx={{ display: 'flex' }}>
+     <NavigationSidebar
+       open={uiStore.sidebarOpen}
+       onToggle={() => uiStore.toggleSidebar()}
+     />
+     <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
+       <Toolbar /> {/* Spacer */}
+       {uiStore.activeView === 'dashboard' && <Dashboard />}
+       {uiStore.activeView === 'tests' && reportStore.runData && <TestList />}
+       {uiStore.activeView === 'analytics' && <AnalyticsView />}
+     </Box>
+     <DetailsSidebar isOpen={isDockOpen} onClose={closeDock}>
+       <TestDetails />
+     </DetailsSidebar>
+   </Box>
  )
})
```

## Build Order (Dependency-aware)

### Phase 1: Theme Foundation (no UI changes visible)

1. **Create UIStore** - standalone, no dependencies
2. **Add UIStore to RootStore** - minimal integration
3. **Create ThemeWrapper** - uses UIStore.muiTheme
4. **Update main.tsx/App.tsx** - wrap with ThemeWrapper
5. **Test:** Theme should work same as before (default light mode)

### Phase 2: Theme Control (visible: toggle works)

6. **Create ThemeToggle component** - uses UIStore.setThemeMode
7. **Add ThemeToggle to AppBar** (temporary location)
8. **Test:** Toggle dark/light/system modes, verify persistence

### Phase 3: Sidebar Infrastructure (visible: new sidebar)

9. **Create NavigationSidebar** - uses UIStore.sidebarOpen/activeView
10. **Create NavItem component** - navigation buttons
11. **Update MainLayout** - add NavigationSidebar, conditional views
12. **Move ThemeToggle** from AppBar to NavigationSidebar
13. **Rename Sidebar to DetailsSidebar** - clarify purpose
14. **Test:** Navigate between views, sidebar collapse/expand

### Phase 4: Bento Grid (visible: new dashboard layout)

15. **Create BentoGrid/BentoCard** - generic components
16. **Refactor Dashboard** - use BentoGrid instead of MUI Grid
17. **Adjust card sizes** - optimize spans for each card type
18. **Test:** Dashboard layout, responsive behavior

### Phase 5: Polish (visible: micro-interactions)

19. **Add transitions** to theme changes
20. **Add hover effects** to BentoCards
21. **Add collapse animations** to NavigationSidebar
22. **Test:** Smooth transitions throughout

## Anti-Patterns to Avoid

### Anti-Pattern 1: Theme in React Context alongside MobX
**What:** Creating separate React context for theme state
**Why bad:** Two competing state systems, sync issues
**Instead:** Keep all UI state in UIStore

### Anti-Pattern 2: Recreating MUI theme on every render
**What:** `createTheme()` inside component body
**Why bad:** Performance - creates new theme object on each render
**Instead:** Use MobX computed property (memoized)

### Anti-Pattern 3: Direct DOM manipulation for theme
**What:** `document.body.classList.add('dark')`
**Why bad:** Bypasses React rendering, MUI theming
**Instead:** Let ThemeProvider handle styling

### Anti-Pattern 4: localStorage in useEffect
**What:** Reading localStorage in useEffect for initial state
**Why bad:** Flash of wrong theme (FOUC)
**Instead:** Read in store constructor (synchronous)

### Anti-Pattern 5: Mixing MUI Grid and CSS Grid
**What:** Using both for different parts of dashboard
**Why bad:** Inconsistent behavior, complex maintenance
**Instead:** CSS Grid via BentoGrid for entire dashboard

## Scalability Considerations

| Concern | At 100 tests | At 500 tests | Mitigation |
|---------|--------------|--------------|------------|
| Theme switch lag | Instant | Instant | Theme is CSS, no data re-render |
| Sidebar nav | Instant | Instant | View switching via flag |
| Dashboard render | <100ms | <200ms | Cards don't depend on test count |
| TestList render | <100ms | ~500ms | Virtualization (Phase 5 or v1.3) |

## Sources

- [MUI Dark Mode Documentation](https://mui.com/material-ui/customization/dark-mode/) - Official MUI theming guidance
- [MobX + MUI Theme Persistence Issue](https://github.com/mui/material-ui/issues/29562) - Community discussion on MobX integration
- [MUI Theming](https://mui.com/material-ui/customization/theming/) - ThemeProvider patterns
- [MUI CSS Grid](https://mui.com/system/grid/) - CSS Grid vs MUI Grid
- [Bento Grid Patterns](https://magicui.design/docs/components/bento-grid) - Modern bento layout approaches
- [localStorage Theme Persistence](https://codyhouse.co/blog/post/store-theme-color-preferences-with-localstorage) - Best practices for theme persistence
