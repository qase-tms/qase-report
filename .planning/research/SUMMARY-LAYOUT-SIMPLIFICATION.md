# Research Summary: Layout Simplification v1.4

**Project:** Qase Report - Test Reporting UI Refactoring
**Milestone:** v1.4 Layout Simplification (Subsequent to v1.2 Theme Refresh)
**Researched:** 2026-02-11
**Overall Confidence:** HIGH (verified with current codebase analysis + official MUI docs + WebSearch findings)

---

## Executive Summary

This milestone refactors the main navigation and test details display from a persistent sidebar-based layout to a compact hamburger menu + modal pattern. The changes involve **four major UI transformations** operating simultaneously:

1. **Remove sidebar** — Currently handles navigation (Dashboard, Tests, etc.), stats display (pass rate ring), and filters
2. **Add hamburger dropdown** — New primary navigation in AppBar
3. **Convert TestDetails to modal** — Move from right-side Drawer to center Dialog
4. **Add persistent status bar** — Move statistics from sidebar to AppBar top bar

**Risk Assessment:** HIGH-MEDIUM complexity. The refactoring combines state management, accessibility, performance, and layout challenges. Critical blockers exist in phases 1-3 if not addressed upfront.

**Key Finding:** The most dangerous pitfall is **orphaned filter state** (#1 in PITFALLS-LAYOUT-SIMPLIFICATION.md). Filters currently managed by TestResultsStore live in SidebarFilters component. Removing sidebar without migrating state ownership causes cascading failures: filters disappear, reappear unexpectedly, or break virtual scrolling.

---

## Key Findings by Domain

### State Management Architecture

**Current state:** TestResultsStore manages filter state; SidebarFilters is presentation layer. NavigationDrawer manages `isNavigationCollapsed` with localStorage persistence.

**Challenge:** Two separate state owners for navigation (NavigationDrawer in RootStore, hamburger will be in AppBar component). Decision needed: should hamburger state persist?

**Recommendation:** Consolidate navigation state in RootStore:
```typescript
// RootStore should own both
isNavigationCollapsed: boolean  // Drawer collapse (existing)
isHamburgerOpen: boolean        // Hamburger dropdown (new)
```
Both persist to localStorage as single key: `navigationState`. Prevents state conflicts and ensures consistency.

### Performance Hotspot: Virtual Scrolling + Modal Interaction

**Current state:** TestList uses react-window for virtual scrolling (can handle 10,000+ tests). TestDetails in right Drawer (doesn't interfere with scrolling).

**Challenge:** Converting Drawer → Modal introduces focus trapping. MUI Dialog's `disableEnforceFocus={false}` (default) + `react-remove-scroll` block all scroll events on body, which breaks react-window's scroll observer.

**Recommendation:** Use responsive approach:
- **Desktop:** Keep Drawer (side-by-side, both scrollable)
- **Mobile:** Switch to fullScreen Dialog (takes over, scrollable content inside)
- Avoid forcing modal on desktop

**Alternative if modal required:** Use `disableEnforceFocus={true}` but test focus restoration.

### Filter State Migration Risk

**Current state:** Filters live in TestResultsStore, displayed in SidebarFilters. SidebarStats shows stats from store.

**Challenge:** When sidebar is removed, filter UI moves to TestList, but state ownership remains unclear. Creates orphaned state scenario.

**Recommendation:**
1. Audit all TestResultsStore filter-related properties
2. Create explicit store actions: `setActiveFilters()`, `removeFilter()`, `clearFilters()`
3. Create separate FilterChips component (observer) that only watches filters
4. Create separate TestList component (observer) that only watches filteredResults
5. Test filter persistence across view transitions

### Accessibility Concerns

**Critical:** Modal focus management must be explicit. Current architecture doesn't track focus before opening modal, so focus restoration will break.

**Recommendation:**
- Store focused element reference before modal opens
- Restore focus on close with `preventScroll: true`
- Test with keyboard navigation and screen reader (VoiceOver/NVDA)
- Implement keyboard shortcuts: Escape to close, Tab to navigate within modal

---

## Implications for Roadmap

### Recommended Phase Structure

#### Phase 1: Foundation & Filter State Migration (Week 1)
**Goal:** Establish new state architecture before removing sidebar

**Work:**
- Audit TestResultsStore filter usage across entire app
- Create `setActiveFilters()`, `clearFilters()`, `removeFilter()` store actions
- Create FilterChips component (separate from TestList)
- Move filter display logic from SidebarFilters to TestList
- Test filter persistence: apply filters, switch views, return, filters should persist
- **Blocker:** Filter state orphaning (#1) must be resolved before phase completion

**Addresses Pitfalls:** #1 (orphaned state), #5 (observer re-renders)

**Avoids:** Removing sidebar before understanding state dependencies

#### Phase 2: Remove Sidebar & Add Hamburger Navigation (Week 2)
**Goal:** Replace navigation UI while preserving all functionality

**Work:**
- Move NavigationDrawer state (`isNavigationCollapsed`, `isHamburgerOpen`) to RootStore
- Move stats display from SidebarStats to new StatusBar component in AppBar
- Create hamburger menu dropdown in AppBar
- Remove NavigationDrawer, SidebarStats, SidebarFilters components
- Test hamburger state persistence (should survive page reload)
- Test hamburger closes on navigation click
- **Blocker:** Hamburger state persistence (#3) must work before completion

**Addresses Pitfalls:** #3 (state persistence), #7 (filter layout), #8 (dropdown closure)

**Avoids:** Losing navigation state, inconsistent UX

#### Phase 3: Convert TestDetails to Modal + Accessibility (Week 3)
**Goal:** Change test details display from side drawer to center modal with accessibility

**Work:**
- Implement responsive test details: Drawer on desktop (≥md breakpoint), fullScreen Dialog on mobile (<md)
- If modal required on desktop: test virtual scrolling with `disableEnforceFocus={true}`
- Implement focus tracking: store focused element before modal, restore on close
- Implement scroll position restoration (save container.scrollTop, restore on close)
- Add accessibility testing: keyboard navigation, screen reader, ARIA attributes
- **Blocker:** Virtual scrolling must work with modal (#2) before phase completion

**Addresses Pitfalls:** #2 (focus trap + scroll), #6 (scroll restoration), #9 (focus restoration)

**Avoids:** Breaking test list navigation, failing accessibility audit

#### Phase 4: Persistent Status Bar & Layout Stability (Week 4)
**Goal:** Add run statistics to AppBar without causing layout shift

**Work:**
- Create StatusBar component with pass/fail/skip counts
- Add `overflow-y: scroll` to html CSS to reserve scrollbar space
- Move SidebarStats display logic to StatusBar
- Test layout shift on modal open/close (measure element positions)
- Test status bar responsiveness on mobile (font-size, padding)
- **Blocker:** Layout shift (#4) must be minimal (<2px tolerance) before completion

**Addresses Pitfalls:** #4 (layout shift), #10 (stats display logic)

**Avoids:** Janky UI, perception of poor quality

---

## Phase Ordering Rationale

**Sequential, not parallel:** Each phase depends on previous completion

1. **Phase 1 must come first** because Phases 2-4 all depend on clean state management. If filter state isn't fixed, everything else fails.

2. **Phase 2 before Phase 3** because hamburger navigation is primary, test details modal is secondary. Users need to navigate before viewing details.

3. **Phase 3 before Phase 4** because modal conversion impacts layout and scrolling. Status bar can't be stabilized until modal behavior is predictable.

4. **Phase 4 last** because status bar is visual polish, not core functionality.

---

## Technology Decisions

### State Management
- **Keep MobX** (already in use, working well)
- **Consolidate navigation state** in RootStore (not split between drawer and component)
- **Use @computed** for derived state (activeFilterCount, filterSummary)
- **Persist to localStorage** with try/catch for file:// protocol

### Modal vs. Drawer
- **Responsive approach recommended:**
  - Desktop (md+): Drawer (right, side-by-side with list, no focus trap)
  - Mobile (sm): Dialog fullScreen (takes over, scroll inside modal)
- **Alternative:** Keep modal with `disableEnforceFocus={true}`, but requires testing

### Filter Chips Layout
- **Flexbox with flexWrap** (handles responsive widths)
- **Test at breakpoints:** 320px, 375px, 768px, 1920px
- **Use minWidth on chips** to prevent truncation

### Status Bar Styling
- **Use html { overflow-y: scroll }** to prevent layout shift
- **Keep StatusBar compact** (use theme.spacing(6) max height)
- **Responsive font-size** (0.875rem on mobile, 1rem on desktop)

---

## Research Flags for Phase-Specific Deeper Dives

### Phase 1: Filter State Migration
- **Flag:** How to handle filter persistence across new vs. old report loads?
- **Flag:** Should filters clear when report changes, or persist?
- **Research needed:** Decision on filter lifecycle policy

### Phase 2: Hamburger Navigation
- **Flag:** Dropdown submenu behavior for future expansion?
- **Flag:** Mobile: hamburger vs. bottom navigation tabs?
- **Research needed:** Long-term navigation UX for mobile

### Phase 3: Modal Accessibility
- **Flag:** How to implement keyboard shortcuts (Escape, Tab navigation)?
- **Flag:** Screen reader announcements for modal open/close?
- **Research needed:** WCAG 2.1 compliance checklist for modal

### Phase 4: Status Bar
- **Flag:** Which stats to display (pass rate, duration, blocked count, etc.)?
- **Flag:** Should status bar be clickable to navigate to analytics?
- **Research needed:** Product requirements for status bar content

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|-----------|-----------|
| **State Architecture** | HIGH | RootStore consolidation verified with current code; MobX patterns well-established |
| **Modal Focus Issues** | HIGH | MUI documentation clear; react-remove-scroll behavior documented; focus trap pitfalls well-known |
| **Virtual Scrolling** | MEDIUM-HIGH | Confirmed with WebSearch; react-window scroll observer works when not blocked, but modal blocking is edge case |
| **Filter State** | HIGH | Current implementation visible in codebase; migration path clear |
| **Accessibility** | MEDIUM | General patterns known; specific WCAG compliance requires phase-specific testing |
| **Performance** | MEDIUM | Observer optimization patterns documented, but real impact depends on test list size (10k+ tests) |
| **Layout Shift** | HIGH | Well-documented issue; solutions (overflow-y: scroll) verified with multiple sources |

---

## Gaps & Open Questions

### Architectural Decisions Needed
- [ ] Should hamburger dropdown remain open while clicking items, or close immediately?
- [ ] Should filters persist when loading a new report, or clear?
- [ ] On mobile: Is fullScreen modal for test details acceptable, or required to keep drawer?
- [ ] Should status bar be interactive, or display-only?

### Design Decisions Needed
- [ ] Status bar content: which metrics to show? (pass/fail/skip counts? duration? pass rate %?)
- [ ] Hamburger dropdown: 1-level or multi-level menu?
- [ ] Filter chips: display in TestList view only, or also in Dashboard?

### Testing Scope
- [ ] What's the actual test list size in production? (10k? 100k? Impacts virtual scroll testing)
- [ ] Screen reader compatibility: which platforms to test? (NVDA, JAWS, VoiceOver?)
- [ ] Mobile devices to test on: which phones/tablets?

### Performance Baseline
- [ ] Current filter click latency? (baseline for "improvement")
- [ ] Virtual list re-mount frequency on filter change? (measure before/after optimization)
- [ ] Bundle size impact of modal conversion? (Dialog vs. Drawer size difference)

---

## Recommended Next Steps

1. **Before starting Phase 1:**
   - Review PITFALLS-LAYOUT-SIMPLIFICATION.md with team
   - Address "Block?" items in Phase-Specific Warnings table
   - Create test plan for filter persistence (#1 pitfall prevention)

2. **During Phase 1:**
   - Implement filter state consolidation in RootStore
   - Create FilterChips component
   - Add integration tests for filter lifecycle
   - Measure performance baseline (filter click latency)

3. **During Phase 2:**
   - Consolidate navigation state in RootStore
   - Test hamburger state persistence across page reload
   - Measure new hamburger interaction performance

4. **During Phase 3:**
   - Test virtual scrolling with modal open (critical blocker)
   - Implement focus tracking and restoration
   - Run accessibility audit with screen reader
   - Measure scroll position accuracy

5. **During Phase 4:**
   - Implement layout shift prevention
   - Test status bar on mobile viewport
   - Verify no double-rendering on modal open/close

---

## Key Metrics for Phase Completion

| Phase | Metric | Target | Measurement |
|-------|--------|--------|-------------|
| Phase 1 | Filter persistence test pass rate | 100% | Automated test suite |
| Phase 1 | Filter click latency | <100ms | React DevTools Profiler |
| Phase 2 | Navigation state persistence | 100% | Manual test + localStorage check |
| Phase 2 | Hamburger closure on nav | 100% | Functional test |
| Phase 3 | Virtual scrolling works with modal | ✓ | Manual test (scroll 1000+ items) |
| Phase 3 | Focus restoration accuracy | 100% | Functional test + keyboard nav test |
| Phase 3 | Accessibility audit pass | WCAG AA | Screen reader + keyboard nav |
| Phase 4 | Layout shift magnitude | <2px | DevTools element position measure |
| Phase 4 | Status bar updates on report load | <200ms | Functional test |

---

## Sources Consulted

- Current codebase: `/src/store/index.tsx`, `/src/components/NavigationDrawer/`, `/src/components/Sidebar/`, `/src/components/SidebarFilters/`, `/src/components/SidebarStats/`
- [MUI Dialog Documentation](https://mui.com/material-ui/react-dialog/)
- [MUI Drawer Documentation](https://mui.com/material-ui/react-drawer/)
- [MobX React Optimizations](https://mobx.js.org/react-optimizations.html)
- [MobX Common Pitfalls](https://github.com/mobxjs/mobx/discussions/3244)
- [Persisting State in localStorage (Josh Comeau)](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/)
- [React Modal Focus Issues](https://github.com/reactjs/react-modal/issues/735)
- [MDN ARIA aria-modal](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)
- [Body Scroll Fighting Guide (Anton Korzunov)](https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac)
- [Hamburger Menu State Management](https://selftaughttxg.com/2024/02-24/developing-a-dynamic-hamburger-menu-in-react-a-step-by-step-guide/)
