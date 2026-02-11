---
phase: 17-progressive-disclosure-performance
plan: 01
subsystem: ui/test-list
tags: [progressive-disclosure, accessibility, state-management, ux]

dependency-graph:
  requires:
    - usePrefersReducedMotion hook (Phase 16)
    - TestList with SuiteGroup architecture
  provides:
    - useSuiteExpandState hook with sessionStorage persistence
    - Controlled SuiteGroup with ARIA accessibility
    - Collapsed-by-default progressive disclosure pattern
  affects:
    - Plan 02 (virtual scrolling) - centralized expand state enables height calculations

tech-stack:
  added:
    - sessionStorage API for expand state persistence
  patterns:
    - Controlled component pattern (lifted state)
    - ARIA disclosure widget pattern (aria-expanded, aria-controls)
    - Set-based state for membership checks

key-files:
  created:
    - src/hooks/useSuiteExpandState.ts
  modified:
    - src/components/TestList/SuiteGroup.tsx
    - src/components/TestList/index.tsx

decisions:
  - Set<string> over Record<string, boolean> for memory efficiency with many suites
  - sessionStorage over localStorage for session-scoped preference
  - encodeURIComponent for suite title IDs to handle special characters safely
  - Empty Set default = all collapsed (progressive disclosure first)

metrics:
  duration: 189
  tasks: 3
  files: 3
  commits: 3
  completed: 2026-02-10T17:17:32Z
---

# Phase 17 Plan 01: Default-Collapsed Suites with Persistent Expand State

**One-liner:** Collapsed-by-default test suites with sessionStorage persistence and ARIA accessibility for progressive disclosure UX

## What Was Built

Implemented progressive disclosure pattern for test suite lists:
1. **useSuiteExpandState hook** - Manages Set<string> of expanded suite titles with sessionStorage persistence
2. **Controlled SuiteGroup** - Refactored from internal state to controlled component with ARIA disclosure widget pattern
3. **TestList integration** - Lifted expand state to parent, enabling centralized state management for future virtual scrolling

## Technical Implementation

### State Management Architecture

```typescript
// useSuiteExpandState.ts
const [expandedSuites, setExpandedSuites] = useState<Set<string>>(() => {
  // SSR-safe initialization from sessionStorage
  const stored = sessionStorage.getItem('qase-report-expanded-suites')
  return stored ? new Set(JSON.parse(stored)) : new Set() // Empty = all collapsed
})

useEffect(() => {
  // Persist on every change
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedSuites]))
}, [expandedSuites])
```

**Design choice:** Set instead of Record for O(1) membership checks and automatic deduplication.

### ARIA Accessibility Pattern

```tsx
// SuiteGroup.tsx
<ListItemButton
  aria-expanded={isExpanded}
  aria-controls={`suite-${encodeURIComponent(suiteTitle)}-content`}
>
  ...
</ListItemButton>
<Collapse
  in={isExpanded}
  id={`suite-${encodeURIComponent(suiteTitle)}-content`}
>
  ...
</Collapse>
```

Implements WCAG 2.1 disclosure widget pattern for screen reader navigation.

### Progressive Disclosure Flow

1. **Initial load:** Empty Set → `expandedSuites.has(suite)` returns false → all suites collapsed
2. **User expands:** Click header → `toggleSuite(suite)` → Set.add → re-render → suite expands
3. **Page refresh:** sessionStorage loaded → previously expanded suites remain expanded
4. **Session end:** Browser tab close → sessionStorage cleared → next session starts fresh

## Success Criteria Verification

- ✓ Test suites collapsed by default when TestList renders
- ✓ Clicking suite header toggles expand/collapse
- ✓ Expanded state persists in sessionStorage (survives refresh)
- ✓ aria-expanded attribute present on all suite headers
- ✓ Screen readers announce collapse state

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | a6dfe14 | feat(17-01): add useSuiteExpandState hook with sessionStorage persistence |
| 2 | 3750549 | refactor(17-01): convert SuiteGroup to controlled component with ARIA |
| 3 | 95b9d39 | feat(17-01): integrate suite expand state in TestList |

## Connection to Phase Objective

**Phase 17 Goal:** Progressive Disclosure & Performance

**This Plan's Role:** Establishes progressive disclosure foundation - users see suite overview first, drill into details on demand. Critical prerequisite for Plan 02 (virtual scrolling), which requires centralized expand state to calculate visible item heights.

**User Impact:** Faster initial scan of test results. Reports with 10+ suites now show compact overview instead of overwhelming expanded list.

## Next Steps

**Plan 02:** Virtual scrolling with react-window
- Will consume `expandedSuites` Set to calculate dynamic row heights
- Render only visible suite headers and expanded tests
- Target: 2000+ test reports render in <100ms

## Self-Check: PASSED

**Created files:**
- ✓ src/hooks/useSuiteExpandState.ts exists

**Modified files:**
- ✓ src/components/TestList/SuiteGroup.tsx contains aria-expanded
- ✓ src/components/TestList/index.tsx uses useSuiteExpandState

**Commits:**
- ✓ a6dfe14 exists in git log
- ✓ 3750549 exists in git log
- ✓ 95b9d39 exists in git log

**Build:**
- ✓ `npm run build` completes successfully
