# Research Summary: Qase Report v1.4 Layout Simplification

**Project:** Qase Report v1.4 — Layout Simplification (Hamburger Menu, Modal Test Details, Persistent Status Bar)
**Domain:** React 18 + TypeScript + MUI + MobX test report visualization refactoring
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

Qase Report v1.4 is a structural refactoring that eliminates the permanent sidebar in favor of a more modern, space-efficient layout. The research validates that **this can be implemented with zero new dependencies**—all features use existing MUI components already in the stack (Menu for navigation dropdown, Dialog for test details modal, Chip/Box for persistent status bar). The MobX state architecture requires minimal changes because navigation and test selection state already exist; the refactoring is **structural (moving components) not semantic (changing state flow)**.

**Recommended approach:** Four-phase implementation with clear architecture boundaries. Phase 1-2 involve additive changes (hamburger menu and status bar), Phase 3 is the critical conversion (drawer to modal with virtual scroll testing), and Phase 4 is cleanup. The most significant risk is Phase 3's modal focus trap interfering with virtual scrolling—research identifies specific prevention strategies (responsive layout or `disableEnforceFocus` flag). Secondary risk is orphaned filter state during sidebar removal if ownership isn't explicitly documented.

**Key timeline insight:** All phases are low-complexity (12-16 hours total estimated effort), but quality requires careful testing of scroll behavior (modal + virtual list interaction), state persistence (filters across navigation), and accessibility (focus restoration, keyboard support). Recommend allocating 2-3 hours for QA per phase.

## Key Findings

### Recommended Stack

**Zero new npm packages needed.** All features implemented using existing MUI 5 primitives already in package.json:

- **MUI Menu + IconButton** (already @mui/material@5.12.0) — Hamburger dropdown navigation with text labels (not icon-only). Pattern: `IconButton(MenuIcon)` opens Menu with MenuItem children. Replaces left NavigationDrawer. Rationale: More discoverable than hidden hamburger on desktop; visible text labels reduce task completion time by ~39% vs icon-only per NN/G research.

- **MUI Dialog** (already in @mui/material@5.12.0) — Modal test details with scrollable content and focus trap. Pattern: `Dialog` with `scroll="paper"` for internal scrolling, `maxWidth="sm"` for sizing. Replaces right Sidebar (Drawer). Rationale: Better UX (overlay doesn't consume permanent space), focus semantics superior to drawer, Escape key support included.

- **MUI Chip + Box + LinearProgress** (already in @mui/material@5.12.0) — Persistent status bar in AppBar showing pass rate, counts, duration, environment. Pattern: Flex Box with Chip components, optional LinearProgress for loading. Rationale: Compact, flexible, theme-aware, no additional styling library needed.

- **Existing MobX store (RootStore)** — No new state management library needed. `activeView`, `isDockOpen`, `selectedTestId` already manage navigation and test selection. Methods (`setActiveView`, `selectTest`, `clearSelection`) already exist.

**Bundle impact: +0KB.** No package.json changes. All components have baked-in accessibility (keyboard nav, focus trap, a11y roles).

### Expected Features

Based on test reporter ecosystem (Allure, ReportPortal, Playwright patterns) and user research (NN/G on hamburger menus):

**Must have (table stakes):**
- Persistent pass/fail/skipped statistics visible in every view (top bar) — Every modern test reporter has this. Currently in sidebar, must move to AppBar
- Navigation to all views (Overview, Tests, Failure Clusters, Gallery, Comparison) in one click — Moving from sidebar drawer to dropdown menu in AppBar
- Test detail inspection with scrollable content (steps, errors, attachments, parameters) — Converting from right drawer to modal dialog
- Test list filtering (status, suite, stability) — Moving from sidebar to test list header, filtering logic unchanged

**Should have (competitive differentiators):**
- Dropdown menu with visible text labels on desktop (not hidden hamburger icon) — Discoverability advantage. NN/G: hidden menus slow users by 39%
- Compact status bar with pass rate ring + "N passed, M failed, K skipped" + run date + environment — Provides at-a-glance context
- Instant modal test details with focus trap and keyboard support (Escape closes, Tab traps focus) — Better accessibility and UX than drawer
- Inline filter persistence (filters stay when navigating between views) — Single source of truth in TestResultsStore

**Defer to v1.5+:**
- Mobile responsive hamburger drawer (currently Desktop-first with dropdown menu)
- Keyboard shortcuts (j/k navigation, 1-5 view shortcuts) — Core nav via menu covers this
- Full WCAG 2.2 accessibility audit — Phase 4 QA will validate 2.1 compliance

### Architecture Approach

The refactoring follows a clear container → component reorganization pattern. **No new state stores needed.** RootStore already manages `activeView` (view switching) and `isDockOpen`/`selectedTestId` (test selection). The change is **where components render** (App level vs nested in MainLayout), not **how state flows**.

**Major components to create/modify:**

1. **HamburgerMenu** (new) — Icon button in AppBar that opens Menu dropdown with 6 navigation items. Reads `activeView` from RootStore, calls `setActiveView()` on click. Local React state for menu anchor (not MobX). Low coupling, highly reusable.

2. **StatusBarPill** (new) — AppBar center section showing pass rate donut (reuse ProgressRingCard), quick stats text, run metadata. Observer component wrapping reportStore data. Replaces RunDateDisplay. No interaction state.

3. **TestDetailsModal** (new) — Dialog wrapper around TestDetails component. Reads `isDockOpen`, `selectedTest`, `clearSelection()` from RootStore. Renders at App level (not nested in MainLayout). Handles all modal lifecycle (open/close/focus).

4. **App.tsx** (modify) — Remove NavigationDrawer import/usage, add HamburgerMenu to AppBar, add StatusBarPill to AppBar center, add TestDetailsModal at root level after MainLayout.

5. **MainLayout** (modify) — Remove Sidebar component and right drawer rendering. Simplify Grid layout to single column. TestList component already has TestListFilters integrated.

6. **RootStore** (modify, minor) — Remove `isNavigationCollapsed` and `toggleNavigation()` (no longer needed). Keep all modal state (`isDockOpen`, `selectedTestId`) and methods (`selectTest`, `clearSelection`).

**Data flow remains unchanged:**
- User clicks test item → `selectTest(testId)` sets `isDockOpen=true` → TestDetailsModal observer triggers → Dialog opens
- User clicks menu item → `setActiveView(view)` updates `activeView` → MainLayout observer triggers → View switches
- Filters change → `testResultsStore` updates → TestList observer re-renders with filtered results

### Critical Pitfalls

Research identified 5 critical and 7 moderate pitfalls. Three block phase completion:

1. **Orphaned filter state during sidebar removal** — SidebarFilters and TestResultsStore are tightly coupled. When sidebar deleted, filter state ownership becomes unclear. Users navigate away and back: filters appear to reset or reappear unpredictably. **Prevention:** Before Phase 1, audit all SidebarFilters state reads/writes. Document explicit ownership in RootStore. Create FilterChips component with clear lifecycle. Test filter persistence across all view transitions (set filters → switch view → return → filters should persist). Add integration test verifying this.

2. **Modal focus trap prevents virtual scrolling in test list** — MUI Dialog's focus trap (`disableEnforceFocus={false}` by default) locks scroll on body via react-remove-scroll. VirtualizedTestList (using react-window) relies on scroll events; when scroll blocked, can only see first 30-40 tests even with 1000+ in list. **Prevention:** Test scroll behavior with modal open BEFORE converting to Dialog. Two options: (a) Use Drawer instead of Dialog, or (b) Use responsive approach (Dialog on mobile, Drawer on desktop). Research recommends responsive pattern. Alternative: set `disableEnforceFocus={true}` on Dialog but then must manually manage focus.

3. **State persistence conflict between hamburger and navigation drawer** — NavigationDrawer already persists `isNavigationCollapsed` to localStorage. New hamburger dropdown uses local React state (lost on refresh). Inconsistency in UX: sometimes state persists, sometimes not. **Prevention:** Make explicit decision about hamburger state persistence. Research recommends moving to RootStore with localStorage persistence like drawer. Add `setHamburgerOpen()` and `loadNavigationState()` methods. Test: open hamburger, refresh, it should still be open. Test: navigate via hamburger, dropdown should auto-close.

Secondary pitfalls (Phase 3-4):
- Layout shift when modal opens (scrollbar disappears, AppBar shifts right) — Prevent with `html { overflow-y: scroll; }`
- Observer over-re-rendering when filter state changes — Use @computed properties and separate components to isolate observer scope

## Implications for Roadmap

Research identifies a clear 4-phase sequence with low interdependencies. Total estimated effort: 12-16 development hours + 4-6 QA hours.

### Phase 1: Hamburger Menu Navigation
**Rationale:** Additive change to AppBar, unblocks Phase 2-3. Must establish that menu-based navigation works before removing sidebar. Low risk, no state changes.
**Delivers:** Navigation via dropdown menu in AppBar. NavigationDrawer component still exists but unused in App. Menu integrates with existing `activeView` state.
**Addresses:** Table stakes (navigation to all views), differentiator (visible menu labels).
**Avoids pitfall:** None specific; establishes navigation pattern before removing sidebar.
**Estimated hours:** 2-3 dev + 1 QA
**Research flags:** None—MUI Menu is battle-tested, well-documented pattern

### Phase 2: Add Persistent Status Bar to AppBar
**Rationale:** Dependency for sidebar removal—status bar must show pass/fail before sidebar deleted. Additive to AppBar. Low risk, visual only.
**Delivers:** Persistent status bar showing pass rate donut, counts, run metadata. Always visible when scrolling. Responsive on mobile.
**Addresses:** Table stakes (persistent statistics), differentiator (compact status pill).
**Avoids pitfall #4:** Must test layout shift on Windows (more noticeable than Mac). Add `html { overflow-y: scroll; }` CSS immediately.
**Estimated hours:** 1-2 dev + 1 QA
**Research flags:** Test on Windows/Linux for scrollbar shift; test mobile viewport. If shift >2px, implement padding-right compensation.

### Phase 3: Convert Sidebar to Modal Test Details
**Rationale:** Critical structural change. Requires thorough testing of scroll behavior and focus management. Should NOT run in parallel with other changes. Test modal → virtual list interaction before committing to Dialog pattern.
**Delivers:** TestDetails opens in Dialog modal instead of right drawer. Modal has focus trap, Escape key, scrollable content.
**Addresses:** Table stakes (test detail inspection), differentiator (instant modal, better UX than drawer).
**Avoids pitfalls #2, #6, #9:** (1) Test scroll with modal open; use responsive approach if scroll broken. (2) Restore scroll position on modal close via sessionStorage. (3) Restore focus to trigger button when modal closes.
**Blockers:** Must pass virtual scroll test (#2 prevention step 2) before proceeding. If scroll doesn't work with Dialog, switch to responsive Drawer pattern.
**Estimated hours:** 3-4 dev + 2 QA (longer due to thorough scroll/focus testing)
**Research flags:** **REQUIRES DEEPER RESEARCH** — Modal focus trap + virtual scrolling is known issue. Must test concrete implementation before full integration. Recommend creating TestDetailsModal prototype with react-window and measuring scroll performance.

### Phase 4: Remove Sidebar Component & Clean Up State
**Rationale:** Final cleanup. Delete NavigationDrawer, Sidebar, SidebarStats, SidebarFilters components (functionality moved to menu, modal, status bar, filter chips). Remove unused state from RootStore.
**Delivers:** Codebase cleanup. App.tsx simplified (fewer imports, simpler layout). MainLayout simplified (single-column Grid).
**Addresses:** Code quality, maintainability.
**Avoids pitfalls #1, #3, #5:** (1) Verify filters still work when sidebar deleted. (2) Verify hamburger state persists. (3) Profile observer render performance (use DevTools Profiler; filter clicks should be <100ms).
**Estimated hours:** 1-2 dev + 1 QA
**Research flags:** None—this is refactoring existing patterns.

### Phase Ordering Rationale

- **Phase 1 before 2-3:** Establishes hamburger navigation pattern. Other phases depend on this working.
- **Phase 2 before 4:** Status bar must exist before sidebar removed (otherwise run info disappears).
- **Phase 3 before 4:** Modal must work and pass scroll tests before deleting sidebar drawer.
- **Phase 4 after all:** Cleanup only after new patterns proven.

This avoids the "remove before replace" anti-pattern. At end of Phase 2, app should still be fully functional with both sidebar and new UI (hamburger + status bar) visible. Phase 3 replaces sidebar with modal. Phase 4 deletes unused sidebar.

### Research Flags

**Phases needing deeper research (during planning):**

- **Phase 3 (Modal + Virtual Scrolling):** Research identified modal focus trap as potential blocker. Before starting implementation, recommend:
  1. Create prototype of TestDetailsModal + VirtualizedTestList
  2. Test scroll behavior: modal open, scroll test list, verify items load beyond first window
  3. If scroll broken, evaluate responsive pattern (Drawer on desktop, Modal on mobile)
  4. Measure DevTools scroll performance: should have <50ms scroll event latency
  5. Test on actual large test list (1000+ items), not just small sample

- **Phase 1-2 (AppBar Layout):** Test toolbar responsive behavior:
  1. Measure HamburgerMenu + StatusBarPill + existing buttons on mobile (320px-375px viewports)
  2. Verify no overflow; test horizontal scrolling doesn't appear
  3. Test icon-only vs text button sizing

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Hamburger Menu):** MUI Menu is well-documented, widely used pattern. No research needed. Implementation straightforward: Icon button + Menu component + MenuItems.
- **Phase 2 (Status Bar):** Chip and Box composition is standard. No research needed.
- **Phase 4 (Cleanup):** Component deletion and import cleanup. No research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | All components verified in current package.json. Zero new dependencies. Official MUI docs confirm patterns. |
| **Features** | HIGH | Validated against Allure, ReportPortal, Playwright test reporters. NN/G research on hamburger menus consulted. |
| **Architecture** | HIGH | Codebase reviewed. RootStore structure confirmed. Observer patterns already in use. Component boundaries clear. |
| **Pitfalls** | HIGH | Five critical pitfalls identified with specific prevention strategies. Tested with official MUI docs, known issues in react-window community. |

**Overall confidence: HIGH**

This is a well-scoped refactoring with clear dependencies, zero external dependencies added, and proven patterns. Primary risk is Phase 3 modal/scroll interaction, which has documented solutions.

### Gaps to Address

- **Mobile breakpoint decision:** Responsive layout (Drawer desktop, Modal mobile) recommended but design mockup not reviewed. Recommend design review before Phase 3 to confirm breakpoint.
- **Filter persistence detail:** Research documents filter state ownership but actual localStorage structure not finalized. Recommend deciding on `localStorage.navigationState` vs separate keys during Phase 1 planning.
- **Hamburger animation:** Research suggests synchronized closure (setActiveView closes menu), but no final animation spec. Determine if menu should fade-out smoothly or snap closed.
- **Status bar metrics:** Which metrics to display (pass rate, duration, env, date) not finalized. Recommend design spec before Phase 2 to size bar correctly.
- **TestDetails modal max-width:** Dialog `maxWidth="sm"` recommended but content width not tested with actual test details. May need adjustment for attachment previews, parameter tables.

## Sources

### Primary (HIGH confidence)

- **STACK-LAYOUT-SIMPLIFICATION.md** — Comprehensive MUI component inventory, bundle analysis, state management review
- **FEATURES.md** — Feature landscape analysis, comparison with Allure/ReportPortal/Playwright, NN/G research on hamburger UX
- **ARCHITECTURE-LAYOUT-SIMPLIFICATION.md** — Codebase architecture review, component boundaries, data flow diagrams
- **PITFALLS-LAYOUT-SIMPLIFICATION.md** — Five critical pitfalls with prevention strategies, phase-specific warnings, pre-phase checklists
- **MUI Official Documentation** — Menu, Dialog, AppBar, Chip components documented and verified working
- **NN/G (Nielsen Norman Group) Hamburger Menu Research** — 39% task time increase with hidden hamburger on desktop

### Secondary (MEDIUM confidence)

- **Playwright Test Report Guide** — Modern test reporter UI conventions
- **MDN ARIA Patterns** — Dialog modal focus management, accessibility requirements
- **Josh W. Comeau: Persisting React State in localStorage** — State persistence patterns
- **react-window Documentation** — Virtual scrolling behavior with overlays

---

**Research completed:** 2026-02-11
**Status:** Ready for roadmap planning
**Next step:** Roadmap creation informed by phase structure and research flags above
