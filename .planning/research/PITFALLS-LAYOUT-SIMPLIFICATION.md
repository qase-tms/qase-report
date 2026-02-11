# Domain Pitfalls: v1.4 Layout Simplification Refactoring

**Domain:** React/MUI test reporting application (Qase Report)
**Refactoring Scope:** Sidebar removal, hamburger navigation, modal test details, persistent status bar
**Researched:** 2026-02-11
**Overall Confidence:** HIGH (verified with official MUI docs, WebSearch findings, and current architecture analysis)

## Executive Summary

This refactoring combines four major UI changes that often create cascading state management and accessibility issues. The most critical pitfall is **orphaned state from sidebar removal**—filter state persists in MobX store but UI moves to main view, creating confusion. Secondary pitfall is **modal focus trapping breaking virtual scrolling**—the test list behind the modal becomes unmanaageable. Third is **state persistence conflicts** between localStorage and component lifecycle.

Expected phases likely to need deeper research: Phase 3 (modal conversion) and Phase 4 (status bar layout stability).

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or severe UX/accessibility breakage.

### Pitfall 1: Orphaned Filter State During Sidebar Removal

**What goes wrong:**
Filters currently live in `SidebarFilters` component (presentation layer) bound to `TestResultsStore` (state layer). When sidebar is removed:
- Filter UI moves to TestList component
- TestResultsStore filter state remains unchanged
- But the "single source of truth" is now unclear
- Users navigate: Dashboard → Tests (filters applied) → Dashboard → Tests (filters appear to reset or reappear unexpectedly)

Example: User filters tests by "failed" status, switches to Dashboard, switches back to Tests. Are filters preserved? Cleared? This depends on whether filter state ownership is explicit.

**Why it happens:**
- SidebarFilters and TestResultsStore evolved together; they're tightly coupled
- No single, documented owner of filter state lifecycle
- When moving components, their state dependencies aren't audited
- Filter persistence to localStorage (if implemented) conflicts with filter UI placement

**Consequences:**
- Data appears to vanish or reappear unpredictably
- Users distrust the application
- Filter state is inconsistent across view transitions
- Performance issues if filters re-evaluate unnecessarily on re-renders
- Hard to debug because state (store) and UI (component) are decoupled across refactoring

**Prevention:**
1. **Before removing sidebar:** Audit all SidebarFilters reads/writes
   - Map what TestResultsStore properties SidebarFilters accesses
   - Document the data flow: user action → store update → UI re-render
   - Identify all places filters are read (TestList, Dashboard, etc.)

2. **Establish explicit state ownership in RootStore:**
   ```typescript
   // In RootStore or TestResultsStore
   setActiveFilters = (filters: FilterMap) => {
     this.activeFilters = filters
     localStorage.setItem('activeFilters', JSON.stringify(filters))
   }

   clearFilters = () => {
     this.activeFilters = new Map()
     localStorage.setItem('activeFilters', JSON.stringify({}))
   }

   // Compute derived state
   @computed get activeFilterCount() {
     return Array.from(this.activeFilters.values()).reduce(
       (sum, group) => sum + group.size,
       0
     )
   }
   ```

3. **Create explicit FilterChip component with clear lifecycle:**
   ```typescript
   // src/components/FilterChips/index.tsx
   export const FilterChips = observer(() => {
     const { testResultsStore } = useRootStore()

     // Component owns the UI, store owns the state
     const handleRemoveFilter = (filterId: string) => {
       testResultsStore.removeFilter(filterId)
     }

     return (
       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
         {testResultsStore.activeFilters.map(filter => (
           <Chip
             key={filter.id}
             label={filter.label}
             onDelete={() => handleRemoveFilter(filter.id)}
           />
         ))}
       </Box>
     )
   })
   ```

4. **Test filter persistence across all view transitions:**
   - Set filters in tests view
   - Switch to dashboard, comparison, gallery
   - Return to tests view
   - Filters should persist (or be intentionally cleared by design—make this choice explicit)
   - Add console logging to store actions during refactoring to catch orphaned updates

5. **Add integration test for filter lifecycle:**
   ```typescript
   test('filters persist when switching views', () => {
     // Load tests
     store.setActiveView('tests')
     store.testResultsStore.setActiveFilters(new Map([['status', new Set(['failed'])]]))

     // Switch away
     store.setActiveView('dashboard')
     expect(store.testResultsStore.activeFilters.size).toBe(1)

     // Switch back
     store.setActiveView('tests')
     expect(store.testResultsStore.activeFilters.size).toBe(1)
   })
   ```

**Detection - Warning Signs:**
- Filters changing unpredictably when switching views
- Filter UI exists but doesn't update store (chips show but filtering doesn't work)
- Store updates but UI doesn't reflect changes (filters applied but chips don't show)
- Duplicate filter state (component local state AND store)
- Users report "my filters disappeared" randomly

**Affected Phase:** Phase 1 (Remove Sidebar) — but block on this before moving forward

**Sources:**
- [MobX Best Practices](https://mobx.js.org/react-optimizations.html)
- [Persisting React State in localStorage](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/)

---

### Pitfall 2: Modal Focus Trap Preventing Virtual Scrolling in Test List

**What goes wrong:**
Converting TestDetails from right Sidebar (Drawer) to Modal Dialog. When modal opens:
- MUI Dialog applies focus trap by default (`disableEnforceFocus={false}`)
- `react-remove-scroll` library (used by MUI Modal) blocks all scroll events on body
- VirtualizedTestList (using react-window) relies on scroll events to trigger new renders
- Result: users see only first ~20-30 tests and cannot load more via scrolling

Example sequence:
1. Test list shows items 1-30 (virtual window)
2. User clicks test #15 → modal opens
3. User closes modal
4. User tries to scroll test list → nothing happens (scroll blocked)
5. User sees same 30 tests, thinks list is broken

**Why it happens:**
- MUI Dialog's focus trap is designed for accessibility: keep focus inside modal to prevent background interaction
- `react-remove-scroll` injects `overflow: hidden` and padding-right on body to prevent jank when scrollbar disappears
- react-window's scroll observer (`onScroll` handler on container) fires but is ignored because body scroll is locked
- Drawer (previous sidebar) had `variant="temporary"` which uses different focus behavior

**Consequences:**
- Users see incomplete test list (appears to have 30-40 tests when there are thousands)
- "Performance feels broken" (really it's UX broken)
- Virtual scrolling provides no benefit (none of the tests beyond first window can be accessed)
- On production builds: users can't run full test suite reports
- Accessibility broken: keyboard users can't Tab to items beyond first window

**Prevention:**
1. **DO NOT blindly convert Drawer → Dialog without testing scroll behavior first**

2. **Test scroll interaction BEFORE converting:**
   ```typescript
   // Add temporary test in TestDetails.test.tsx
   test('virtual list scrolls while modal is open', () => {
     const { getByText, queryByText } = render(<TestList />)

     // Should see first item
     expect(getByText('Test_001')).toBeInTheDocument()

     // Should NOT see item #100 (out of virtual window)
     expect(queryByText('Test_100')).not.toBeInTheDocument()

     // Open modal
     fireEvent.click(getByText('Test_001'))
     expect(getByRole('dialog')).toBeInTheDocument()

     // Try to scroll
     const container = getByTestId('virtual-list-container')
     fireEvent.scroll(container, { target: { scrollY: 500 } })

     // Modal still open, but scroll worked
     expect(getByRole('dialog')).toBeInTheDocument()
     // New items should be in virtual window (depending on implementation)
   })
   ```

3. **If modal MUST prevent list scrolling (focus trap required):**
   - **Use Drawer instead of Dialog** — keeps same DOM structure, different interaction model
   - **Or use Dialog with `disableEnforceFocus={true}`:**
     ```typescript
     <Dialog
       open={isDockOpen}
       onClose={closeDock}
       disableEnforceFocus={true}  // Allow scrolling behind modal
       disableRestoreFocus={false}   // Still restore focus on close
     >
     ```

4. **If modal AND scrollable list required:**
   - **Split-pane layout on desktop** (side-by-side, both scrollable)
   - **Modal only on mobile** (use responsive variant)
   - **Or: modal with internal scroll** (put scrollable content inside modal, not behind it)

5. **Responsive approach (RECOMMENDED):**
   ```typescript
   export const TestDetails = observer(() => {
     const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
     const { isDockOpen, closeDock } = useRootStore()

     if (isMobile) {
       // Modal on mobile (full screen, takes over)
       return (
         <Dialog
           fullScreen
           open={isDockOpen}
           onClose={closeDock}
           disableEnforceFocus={false}  // OK to trap focus on mobile
         >
           <TestDetailsContent />
         </Dialog>
       )
     } else {
       // Drawer on desktop (side-by-side with list)
       return (
         <Drawer
           open={isDockOpen}
           onClose={closeDock}
           anchor="right"
         >
           <TestDetailsContent />
         </Drawer>
       )
     }
   })
   ```

**Detection - Warning Signs:**
- Virtual list stops loading new items when modal opens
- Scroll events logged but list doesn't re-render
- Browser console shows "focus locked to modal element"
- Only first N items visible (N = virtual window size)
- Scrolling test list when modal open has no effect

**Affected Phase:** Phase 3 (Convert to Modal) — block on this before phase completion

**Sources:**
- [MUI Dialog - Focus Management](https://mui.com/material-ui/react-dialog/)
- [React Modal Scroll & Focus Issues](https://github.com/reactjs/react-modal/issues/735)
- [react-remove-scroll: Focus Trapping and Scroll Locking](https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac)

---

### Pitfall 3: State Persistence Conflict Between Hamburger Dropdown and Navigation

**What goes wrong:**
NavigationDrawer currently persists `isNavigationCollapsed` to localStorage. Refactoring converts it to hamburger dropdown in AppBar. Two state problems emerge:

1. **Inconsistent persistence:** Hamburger dropdown state is local component state (lost on refresh), but drawer collapse was localStorage (persisted)
2. **State conflict:** Both drawer and hamburger try to own "navigation visibility", creating confusion about which is responsible

Example:
- User opens hamburger dropdown, selects "Tests"
- Dropdown closes, navigation happens
- User refreshes page
- Hamburger dropdown is closed (state lost)
- User might expect dropdown to remember it was just open, or expect it to stay closed—inconsistency

**Why it happens:**
- NavigationDrawer already manages `isNavigationCollapsed` in RootStore with localStorage
- Hamburger dropdown is new component in AppBar with local `useState`
- No decision about "should hamburger state persist?" before implementation
- Mixing localStorage persistence (drawer) with component state (dropdown) creates confusion

**Consequences:**
- Users frustrated by lost navigation state ("why did it close?")
- Inconsistent UX: sometimes state persists, sometimes it doesn't
- Navigation drawer and hamburger compete for localStorage keys
- Browser DevTools shows confusing state changes
- Mobile users particularly affected (small screen, dropdown is primary nav, state loss annoying)

**Prevention:**
1. **Make explicit decision: Should hamburger state persist?**
   - **If YES (recommended for UX):** Move to RootStore with localStorage
   - **If NO:** Document this choice and make local state intentional

2. **Implement in RootStore (RECOMMENDED):**
   ```typescript
   export class RootStore {
     // Existing navigation state
     isNavigationCollapsed = false
     activeView = 'dashboard'

     // NEW: Hamburger dropdown state
     isHamburgerOpen = false

     constructor() {
       makeAutoObservable(this)
       this.loadNavigationState()
     }

     private loadNavigationState() {
       try {
         const stored = localStorage.getItem('navigationState')
         if (stored) {
           const { isNavigationCollapsed, isHamburgerOpen } = JSON.parse(stored)
           this.isNavigationCollapsed = isNavigationCollapsed
           this.isHamburgerOpen = isHamburgerOpen
         }
       } catch (e) {
         console.warn('Failed to load navigation state')
       }
     }

     private saveNavigationState() {
       localStorage.setItem(
         'navigationState',
         JSON.stringify({
           isNavigationCollapsed: this.isNavigationCollapsed,
           isHamburgerOpen: this.isHamburgerOpen,
         })
       )
     }

     toggleNavigation = () => {
       this.isNavigationCollapsed = !this.isNavigationCollapsed
       this.saveNavigationState()
     }

     toggleHamburger = () => {
       this.isHamburgerOpen = !this.isHamburgerOpen
       this.saveNavigationState()
     }

     setHamburgerOpen = (open: boolean) => {
       this.isHamburgerOpen = open
       this.saveNavigationState()
     }
   }
   ```

3. **Handle dropdown closure on item click:**
   ```typescript
   // In AppBar or hamburger component
   const handleNavigationClick = (view: 'tests' | 'dashboard' | ...) => {
     setActiveView(view)
     setHamburgerOpen(false)  // Close immediately on navigation
   }
   ```

4. **Test state persistence:**
   ```typescript
   test('hamburger state persists across page reload', () => {
     // Open hamburger
     store.setHamburgerOpen(true)
     expect(store.isHamburgerOpen).toBe(true)

     // Simulate page reload
     const stored = localStorage.getItem('navigationState')
     localStorage.clear()
     const store2 = new RootStore()
     localStorage.setItem('navigationState', stored)
     store2.loadNavigationState()

     expect(store2.isHamburgerOpen).toBe(true)
   })
   ```

**Detection - Warning Signs:**
- Users report "I closed the menu, why is it open again?" (or vice versa)
- Multiple boolean state variables for navigation (`isNavOpen`, `isDropdownOpen`, `isNavigationCollapsed`)
- localStorage has multiple keys for similar concepts
- DevTools shows state changes that don't match user actions

**Affected Phase:** Phase 2 (Add Hamburger Navigation) — block on this before phase completion

**Sources:**
- [Persisting State with localStorage](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c)
- [Hamburger Menu State Management](https://selftaughttxg.com/2024/02-24/developing-a-dynamic-hamburger-menu-in-react-a-step-by-step-guide/)

---

### Pitfall 4: Persistent Status Bar Causes Layout Shift When Modal Opens

**What goes wrong:**
Adding persistent status bar in AppBar showing run stats (pass rate, duration, etc.). When modal TestDetails opens:
- Modal uses `react-remove-scroll` internally (injected by MUI)
- This applies `padding-right: ${scrollbarWidth}px` to body to hide scrollbar
- Content shifts right as scrollbar disappears (~15px on Windows, varies by OS)
- Status bar in AppBar may or may not shift, causing misalignment or visual flicker
- On mobile: shift is more noticeable (smaller screen = larger percentage shift)

Example: Status bar showing "Passed: 45 | Failed: 3 | Duration: 2m30s" — text jumps right when modal opens.

**Why it happens:**
- Scrollbar is space in layout on non-Mac browsers (Windows, Linux, most browsers)
- When modal locks scroll (via react-remove-scroll), scrollbar space is removed
- `padding-right` applied to body to compensate, but may not apply to fixed/sticky elements correctly
- AppBar is `position: fixed` — it may or may not inherit body padding depending on CSS specificity
- Status bar content in AppBar has dynamic width (metrics change) — shift magnitude varies

**Consequences:**
- UI appears broken ("why is the header jumping?")
- Content flickers/jitters on modal open/close
- Status bar text becomes hard to read during shift
- On mobile: shift can be 10-20% of screen width (very noticeable)
- Accessibility: motion-sensitive users may feel disoriented
- Perception of poor quality ("this app is buggy")

**Prevention:**
1. **Test layout shift BEFORE implementing status bar:**
   - Add temporary status bar to AppBar
   - Measure element positions with DevTools before/after modal open
   - Check on Windows/Linux (more noticeable) AND Mac (less noticeable)
   - Test on mobile viewport (simulate iPhone 12)

2. **Reserve scrollbar space proactively (RECOMMENDED):**
   ```css
   /* Force scrollbar space reservation even when scroll not visible */
   html {
     overflow-y: scroll;
   }
   ```
   This prevents layout shift entirely because scrollbar space is always reserved.

3. **Or: Adjust fixed headers explicitly:**
   ```typescript
   // In AppBar component
   useEffect(() => {
     if (isDockOpen) {
       // When modal opens, apply padding to keep AppBar stable
       document.documentElement.style.paddingRight = getScrollbarWidth() + 'px'
     } else {
       document.documentElement.style.paddingRight = '0'
     }
   }, [isDockOpen])

   function getScrollbarWidth(): number {
     const div = document.createElement('div')
     div.style.width = '100px'
     div.style.height = '100px'
     div.style.overflow = 'scroll'
     div.style.position = 'absolute'
     div.style.left = '-9999px'
     document.body.appendChild(div)
     const width = div.offsetWidth - div.clientWidth
     document.body.removeChild(div)
     return width
   }
   ```

4. **For status bar specifically:**
   - Keep it small/minimal so shift is less noticeable
   - Use flex layout (avoids width constraints)
   - Use monospace font for metrics (same width regardless of content)
   - Test on mobile: simulate actual phone (not just DevTools)

5. **CSS protection approach:**
   ```typescript
   // src/App.tsx
   useEffect(() => {
     // Prevent layout shift on modal open
     const style = document.createElement('style')
     style.textContent = `
       html {
         overflow-y: scroll;  /* Always reserve scrollbar space */
       }
     `
     document.head.appendChild(style)
   }, [])
   ```

6. **Measure actual impact:**
   ```typescript
   // In test
   test('status bar does not shift when modal opens', () => {
     const statusBar = getByTestId('status-bar')
     const positionBefore = statusBar.getBoundingClientRect().x

     // Open modal
     fireEvent.click(getByRole('button', { name: /test/i }))

     const positionAfter = statusBar.getBoundingClientRect().x
     expect(Math.abs(positionBefore - positionAfter)).toBeLessThan(2)  // Allow 2px tolerance
   })
   ```

**Detection - Warning Signs:**
- Content visibly shifts when modal opens/closes
- Status bar text becomes misaligned or hard to read
- Users report feeling disoriented by movement
- Different behavior on Windows vs. Mac
- Mobile viewport: shift is extreme

**Affected Phase:** Phase 4 (Add Persistent Status Bar) — block on this before phase completion

**Sources:**
- [How to Fight Body Scroll](https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac)
- [Fixed Header Layout Shift Issues](https://github.com/radix-ui/primitives/discussions/1586)

---

### Pitfall 5: Observer Component Over-Re-rendering During Filter Movement

**What goes wrong:**
When moving filters from Sidebar to TestList:
- TestList is wrapped in `observer()` to watch testResultsStore
- TestList accesses both `testResultsStore.filteredResults` AND `testResultsStore.activeFilters`
- MobX re-renders TestList on ANY observable access
- Every filter change triggers entire TestList re-render, including VirtualizedTestList child
- VirtualizedTestList re-mounts on parent change, defeating virtual scrolling optimization
- Result: lag when clicking filters, scroll position resets, CPU spike

Example: User clicks "failed" filter chip → TestList observer fires → VirtualizedTestList remounts → virtual window resets → users are scrolled to top

**Why it happens:**
- `observer()` makes component reactive to **any** observable property accessed in render
- If TestList's render accesses `activeFilters` and `filteredResults`, both trigger re-render
- MobX doesn't distinguish between "user changed filters" and "data was added" — both invalidate observer
- VirtualizedTestList uses react-window internally, which mounts with state from parent
- Each parent re-render creates new props, triggering VirtualizedTestList to re-compute virtual window

**Consequences:**
- Filtering becomes slow (200ms+ lag on large test lists)
- Virtual scrolling provides zero benefit (entire list re-renders on filter change)
- Scroll position resets to top when user clicks filter
- Users frustrated: "why does it jump around?"
- CPU spike visible in performance monitoring
- On slow devices (older laptops, low-end phones): noticeable freeze

**Prevention:**
1. **Optimize observer access patterns using @computed:**
   ```typescript
   // In TestResultsStore
   @computed get activeFilterCount() {
     return Array.from(this.activeFilters.values()).reduce(
       (sum, group) => sum + group.size,
       0
     )
   }

   @computed get filterSummary() {
     // Return aggregate data, not individual filters
     return {
       count: this.activeFilterCount,
       isFiltered: this.activeFilterCount > 0,
     }
   }
   ```

2. **In TestList, access only derived computed values:**
   ```typescript
   export const TestList = observer(() => {
     const { testResultsStore, selectTest } = useRootStore()
     // Only dereference computed property, not entire filter map
     const { filteredResults, filterSummary } = testResultsStore

     return (
       <Paper>
         {filterSummary.isFiltered && (
           <Typography>
             {filterSummary.count} filter{filterSummary.count !== 1 ? 's' : ''} active
           </Typography>
         )}
         {/* ... */}
       </Paper>
     )
   })
   ```

3. **Separate filter UI from list UI (RECOMMENDED):**
   ```typescript
   // src/components/FilterChips/index.tsx
   export const FilterChips = observer(() => {
     const { testResultsStore } = useRootStore()
     // This component only watches filters
     return (
       <Box>
         {testResultsStore.activeFilters.map(f => (
           <Chip key={f.id} />
         ))}
       </Box>
     )
   })

   // src/components/TestList/index.tsx
   export const TestList = observer(() => {
     const { testResultsStore } = useRootStore()
     // This component only watches filteredResults
     return (
       <Paper>
         <FilterChips />  {/* Separated component */}
         <VirtualizedTestList items={testResultsStore.filteredResults} />
       </Paper>
     )
   })
   ```

4. **Wrap VirtualizedTestList in useMemo:**
   ```typescript
   export const TestList = observer(() => {
     const { testResultsStore, selectTest } = useRootStore()
     const { filteredResults } = testResultsStore

     const virtualList = useMemo(
       () => (
         <VirtualizedTestList
           grouped={groupBySuite(filteredResults)}
           onSelectTest={selectTest}
           height={400}
         />
       ),
       [filteredResults, selectTest]  // Only re-create if data changes, not filters
     )

     return <Paper>{virtualList}</Paper>
   })
   ```

5. **Test performance with profiler:**
   - Open React DevTools Profiler
   - Click filter chips 10 times
   - Measure render count and duration
   - Target: <100ms per filter click, <3 re-renders per click
   - VirtualizedTestList should mount once per filter change, not multiple times

**Detection - Warning Signs:**
- Lag when clicking filter chips (>200ms render time in DevTools)
- Virtual list jumps around or resets scroll position when filtering
- DevTools Profiler shows TestList re-rendering 5+ times on single filter click
- React DevTools shows VirtualizedTestList component appearing/disappearing in component tree

**Affected Phase:** Phase 1-3 (all phases using TestList) — critical for performance

**Sources:**
- [MobX React Optimizations](https://mobx.js.org/react-optimizations.html)
- [MobX Common Pitfalls](https://github.com/mobxjs/mobx/discussions/3244)

---

## Moderate Pitfalls

Issues that cause significant friction but are recoverable with rework.

### Pitfall 6: Modal Scroll Position Resets After Closing

**What goes wrong:**
User scrolls test list to item #150, clicks to open modal. Modal closes. Page scrolls back to top instead of returning to item #150.

**Why it happens:**
- MUI Modal/Dialog uses `focus()` on elements to manage focus state
- Browser's default focus behavior auto-scrolls element into view
- `react-remove-scroll` restores scroll position but sometimes restores to wrong element
- If TestList container reference is lost during modal lifecycle, scroll restoration fails

**Consequences:**
- Users must scroll back to find their place
- On long test lists (10,000+ tests), recovery is tedious
- Accessibility: violates WCAG expectation of focus restoration
- Users feel like UX is broken ("why did it jump?")

**Prevention:**
1. **Save scroll position before opening modal:**
   ```typescript
   const containerRef = useRef<HTMLDivElement>(null)
   const [scrollPos, setScrollPos] = useState(0)

   const openTestModal = (testId: string) => {
     if (containerRef.current) {
       setScrollPos(containerRef.current.scrollTop)
     }
     selectTest(testId)
   }

   const closeTestModal = () => {
     clearSelection()
     // Restore scroll after modal closes (next frame)
     setTimeout(() => {
       if (containerRef.current) {
         containerRef.current.scrollTop = scrollPos
       }
     }, 0)
   }
   ```

2. **Use focus restoration with `preventScroll` flag:**
   ```typescript
   useEffect(() => {
     if (!isDockOpen && triggerButtonRef.current) {
       // Restore focus without scrolling
       triggerButtonRef.current.focus({ preventScroll: true })
     }
   }, [isDockOpen])
   ```

3. **Store scroll position in sessionStorage (survives navigation):**
   ```typescript
   useEffect(() => {
     if (containerRef.current) {
       const stored = sessionStorage.getItem('testListScroll')
       if (stored) {
         containerRef.current.scrollTop = parseInt(stored, 10)
       }
     }
   }, []) // Only on mount

   const handleScroll = (e: UIEvent) => {
     const target = e.currentTarget as HTMLDivElement
     sessionStorage.setItem('testListScroll', target.scrollTop.toString())
   }
   ```

4. **Test on real test list with 1000+ items:**
   - Scroll to item 500
   - Open modal
   - Close modal
   - Scroll position should be preserved

**Detection - Warning Signs:**
- Users report "scroll position resets when I close the modal"
- Test list jumps to top after modal close

**Affected Phase:** Phase 3 (Modal Conversion)

---

### Pitfall 7: Filter Chips Layout Breaks in Flexible Container

**What goes wrong:**
Moving filter chips from Sidebar (fixed width 240px) to TestList view (flexible width). Chips layout breaks at certain viewport widths:
- Chips wrap unexpectedly or stack oddly
- Some chips hidden under scroll container
- Alignment broken because Sidebar had fixed width, TestList is flexible
- Mobile: chips get cut off or overlap other UI

**Why it happens:**
- Sidebar had `width: 240px` (or 64px collapsed) — predictable space
- TestList is full-width, uses Grid with `spacing={2}`
- Chips component CSS assumes Sidebar's fixed width in media queries
- No CSS media query for "chips in flexible container"
- MUI Grid gutter can conflict with chip spacing

**Consequences:**
- Chips overlap or hide (UI looks broken)
- Layout looks unprofessional
- Mobile viewport: chips stack awkwardly, take up too much space
- Users can't remove filters because chip delete icons are hidden

**Prevention:**
1. **Test responsive widths BEFORE moving filters:**
   - 320px (iPhone SE)
   - 375px (iPhone 12)
   - 768px (iPad)
   - 1024px (iPad Pro)
   - 1920px (desktop)

2. **Use flexible CSS for chips in TestList:**
   ```typescript
   <Box sx={{
     display: 'flex',
     flexWrap: 'wrap',
     gap: 1,
     mb: 2,
     maxWidth: '100%',  // Constrain to parent
   }}>
     {/* chips here */}
   </Box>
   ```

3. **Add CSS class for chip overflow handling:**
   ```css
   .filter-chips {
     display: flex;
     flex-wrap: wrap;
     gap: 0.5rem;
     margin-bottom: 1rem;
   }

   .filter-chips-chip {
     flex-shrink: 0;  /* Prevent chip truncation */
   }

   @media (max-width: 600px) {
     .filter-chips-chip {
       font-size: 0.875rem;  /* Smaller on mobile */
     }
   }
   ```

4. **Test on real mobile devices** (not just DevTools emulation)

**Detection - Warning Signs:**
- Chips overlap or hide on certain window widths
- Different layout on mobile vs. desktop
- Chips push other content off-screen
- Horizontal scrolling appears when it shouldn't

**Affected Phase:** Phase 1 (Remove Sidebar) — test before phase completion

---

### Pitfall 8: Hamburger Dropdown Doesn't Close When Navigation Item Clicked

**What goes wrong:**
User opens hamburger dropdown, clicks "Tests" link. Dropdown stays open. User has to click elsewhere or wait for auto-close. Navigation works but UX feels janky.

**Why it happens:**
- Hamburger dropdown has local state: `isDropdownOpen`
- Navigation click triggers store action: `setActiveView('tests')`
- These are decoupled — dropdown state isn't aware of navigation
- If dropdown close is in `useEffect` watching `activeView`, timing might be off (async state update)

**Consequences:**
- Users confused by open dropdown after navigation
- Multiple clicks needed to fully dismiss menu
- On mobile: dropdown blocks screen space, takes up valuable real estate
- UX feels incomplete

**Prevention:**
1. **Close dropdown synchronously with navigation:**
   ```typescript
   const handleNavigate = (view: ViewType) => {
     setActiveView(view)
     setIsDropdownOpen(false)  // Close immediately, synchronously
   }
   ```

2. **Or: manage both in store (RECOMMENDED):**
   ```typescript
   setActiveView = (view: string) => {
     this.activeView = view
     this.isHamburgerOpen = false  // Close hamburger when navigating
   }
   ```

3. **Avoid useEffect for this:**
   ```typescript
   // BAD - timing might be off
   useEffect(() => {
     setIsDropdownOpen(false)
   }, [activeView])

   // GOOD - synchronous, guaranteed closure
   const handleNavigate = (view: string) => {
     setActiveView(view)
     setIsDropdownOpen(false)
   }
   ```

4. **Test: Click hamburger, click item, dropdown should close before view updates**

**Detection - Warning Signs:**
- Dropdown stays open after clicking navigation item
- Multiple clicks needed to navigate and close menu
- Users complain about "sticky menu"

**Affected Phase:** Phase 2 (Add Hamburger Navigation)

---

### Pitfall 9: Accessibility - Modal Focus Not Restoring to Trigger Button

**What goes wrong:**
User clicks test item (trigger button) to open modal. Modal opens. User closes modal. Focus should return to the test item row, but instead it goes to AppBar or body.

**Why it happens:**
- TestList item doesn't store focus before opening modal
- Modal's `autoFocus` focuses first input in modal
- When closed, focus goes to document.body (browser default)
- No `relatedTarget` or `previousFocus` tracking

**Consequences:**
- Screen reader users lose their place in document
- Keyboard-only users have to navigate back to where they were
- WCAG 2.1 SC 2.4.3 violation: Focus visible must be managed
- Accessibility audit fails

**Prevention:**
1. **Track focused element before opening modal:**
   ```typescript
   const onSelectTest = (testId: string) => {
     // Store current focus
     const previousFocus = document.activeElement as HTMLElement
     selectTest(testId)
     // Store in component state or context for later restoration
   }
   ```

2. **Restore focus on close:**
   ```typescript
   useEffect(() => {
     if (!isDockOpen && previousFocus) {
       previousFocus.focus({ preventScroll: true })
     }
   }, [isDockOpen])
   ```

3. **Test with keyboard navigation:**
   - Tab through test items
   - Press Enter to open modal
   - Close modal (Escape key)
   - Focus should be on the test item
   - Tab again, focus should continue from that item

4. **Test with screen reader:**
   - Open VoiceOver (Mac) or NVDA (Windows)
   - Navigate to test, open modal
   - Close modal, verify VoiceOver announces correct element

**Detection - Warning Signs:**
- Screen readers announce wrong element after modal closes
- Keyboard navigation breaks after closing modal
- No visual focus indicator on trigger element

**Affected Phase:** Phase 3 (Modal Conversion) — must address for accessibility

---

## Minor Pitfalls

### Pitfall 10: Status Bar Display Logic Not Updated When Removing Sidebar Stats

**What goes wrong:**
SidebarStats shows pass rate, duration, etc. Moving this to status bar. But display logic for "what stats to show" isn't updated. Status bar shows old data, or shows data from previous run after loading new report.

**Prevention:**
- Move SidebarStats logic to status bar component
- Ensure status bar updates when `reportStore.runData` changes
- Test data flow: load report A, check status bar, load report B, status bar updates immediately
- Add test: "status bar updates when new report is loaded"

---

### Pitfall 11: TestDetails Modal Scrolling Broken on Small Screens

**What goes wrong:**
TestDetails content (steps, attachments, error) is long. On modal in 600px wide screen, user can't scroll modal content. Modal height is limited by viewport, content overflows.

**Prevention:**
- Add `sx={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}` to TestDetails content
- Test on real mobile devices (not just DevTools)
- Consider Dialog + fullScreen on mobile for better UX

---

### Pitfall 12: Hamburger Dropdown Menu Items Inconsistent Width

**What goes wrong:**
Menu items (Dashboard, Tests, Failure Clusters) have variable width. Some labels longer than others. Menu looks janky.

**Prevention:**
- Set `minWidth` on dropdown items:
  ```typescript
  <MenuItem sx={{ minWidth: 200 }}>Tests</MenuItem>
  ```
- Or use max-width constraint to prevent runaway width

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Severity | Mitigation | Block? |
|-------|-------|----------------|----------|-----------|--------|
| **Phase 1: Remove Sidebar** | State Orphaning | Filter/stats state persists but UI removed (#1) | CRITICAL | Audit store; move state ownership; test persistence | YES |
| **Phase 1: Remove Sidebar** | Layout Changes | Content shifts unexpectedly | MODERATE | Test full-width layout on all viewports (#7) | NO |
| **Phase 2: Add Hamburger** | Navigation State | Hamburger dropdown state not persisted (#3) | CRITICAL | Move to RootStore; persist to localStorage | YES |
| **Phase 2: Add Hamburger** | Closure Behavior | Dropdown doesn't close on item click (#8) | MODERATE | Close synchronously, not in effect | NO |
| **Phase 3: Modal Details** | Focus Trapping | Virtual list scrolling breaks (#2) | CRITICAL | Test scroll with modal open; use Drawer+responsive or disableEnforceFocus | YES |
| **Phase 3: Modal Details** | Scroll Restoration | Scroll position resets after close (#6) | MODERATE | Save/restore scroll position; test with 1000+ items | NO |
| **Phase 3: Modal Details** | Accessibility | Focus not restored to trigger (#9) | MODERATE | Track previous focus; restore on close | NO |
| **Phase 4: Persistent StatusBar** | Layout Shift | Content shifts when modal opens (#4) | MODERATE | Use overflow-y: scroll; measure shift impact | NO |
| **Cross-Phase** | Performance | Observer over-re-renders (#5) | MODERATE | Use @computed; separate components; memoize virtual list | NO |
| **Cross-Phase** | Chip Layout | Filters break in flexible container (#7) | MINOR | Test responsive widths; use flexWrap | NO |

---

## Pre-Phase Checklist

### Before Phase 1 (Remove Sidebar)
- [ ] All SidebarFilters state reads/writes in TestResultsStore documented
- [ ] Filter state ownership decision made and documented
- [ ] New FilterChips component interface designed
- [ ] Filter persistence test plan created
- [ ] Full-width layout tested on 320px, 768px, 1920px viewports
- [ ] Sidebar removal does not lose any functionality

### Before Phase 2 (Add Hamburger)
- [ ] Hamburger state persistence decision made
- [ ] NavigationDrawer and hamburger state consolidated in RootStore
- [ ] Dropdown closure behavior tested (must close on nav click)
- [ ] Mobile viewport tested (hamburger works on 375px width)
- [ ] No double-navigation (shouldn't duplicate nav items)

### Before Phase 3 (Modal Conversion)
- [ ] Virtual list scroll behavior tested with modal open
- [ ] Drawer vs. Modal decision made (recommend responsive: Drawer on desktop, Modal on mobile)
- [ ] Focus restoration implemented and tested
- [ ] Scroll position restoration implemented
- [ ] Modal accessibility tested with screen reader
- [ ] TestDetails content scrolling works on small screens

### Before Phase 4 (Persistent Status Bar)
- [ ] Layout shift measured and prevented (overflow-y: scroll added or padding-right managed)
- [ ] Status bar display logic moved from SidebarStats
- [ ] Status bar updates on new report load
- [ ] Mobile viewport tested (status bar doesn't overflow)
- [ ] Responsive height/font-size defined for different viewports

### Cross-Phase
- [ ] MobX observer usage optimized (@computed used for derived state)
- [ ] Filter chip layout tested on responsive widths (320px, 375px, 768px, 1920px)
- [ ] Performance profiled: filter clicks <100ms, virtual list doesn't re-mount on filter change
- [ ] Accessibility audit: focus management, keyboard navigation, screen reader compatibility

---

## Sources

- [MUI Dialog & Modal Documentation](https://mui.com/material-ui/react-dialog/)
- [MUI Drawer Documentation](https://mui.com/material-ui/react-drawer/)
- [MobX React Optimizations](https://mobx.js.org/react-optimizations.html)
- [MobX Common Pitfalls & Best Practices](https://github.com/mobxjs/mobx/discussions/3244)
- [MDN: ARIA aria-modal](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)
- [Persisting React State in localStorage (Josh W. Comeau)](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/)
- [Using localStorage with React Hooks (LogRocket)](https://blog.logrocket.com/using-localstorage-react-hooks/)
- [How to Fight Body Scroll (Anton Korzunov)](https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac)
- [React Modal Focus & Scroll Issues](https://github.com/reactjs/react-modal/issues/735)
- [Hamburger Menu State Management Guide](https://selftaughttxg.com/2024/02-24/developing-a-dynamic-hamburger-menu-in-react-a-step-by-step-guide/)
- [react-remove-scroll Documentation](https://github.com/theKashey/react-remove-scroll)
- [Fixed Header Layout Shift (Radix UI)](https://github.com/radix-ui/primitives/discussions/1586)
