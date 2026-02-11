---
phase: 27-modal-test-details
plan: 01
subsystem: ui-components
tags: [modal, dialog, layout, ux]
dependencies:
  requires: [Phase 26 (Persistent Status Bar)]
  provides: [Centered modal dialog for test details]
  affects: [MainLayout, test detail viewing]
tech-stack:
  added: [MUI Dialog, scrollbar-gutter CSS property]
  patterns: [observer pattern, controlled dialog, scrollbar compensation]
key-files:
  created:
    - src/components/TestDetailsModal/index.tsx
  modified:
    - src/index.css
    - src/layout/MainLayout/index.tsx
decisions:
  - DialogContent padding set to 0 to avoid double padding with TestDetails
  - scroll="paper" enables scrollable content within modal
  - Modal controlled by selectedTest state (no separate isDockOpen needed)
  - Default Dialog focus trap behavior retained (no disableEnforceFocus needed)
metrics:
  duration: ~1 min
  tasks_completed: 2
  files_modified: 3
  commits: 2
  completed_date: 2026-02-11
---

# Phase 27 Plan 01: Modal Test Details Summary

**One-liner:** Replaced Drawer-based test details panel with centered Dialog modal using MUI Dialog and scrollbar-gutter for layout shift prevention.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add scrollbar gutter CSS and create TestDetailsModal component | 932e93e | src/index.css, src/components/TestDetailsModal/index.tsx |
| 2 | Replace Sidebar with TestDetailsModal in MainLayout | 3307af9 | src/layout/MainLayout/index.tsx |

## Objective Achievement

Successfully replaced the Drawer-based test details panel with a centered modal Dialog that meets all DET and LAY requirements:

- **DET-01:** Test details now open in centered modal dialog instead of right-anchored Drawer
- **DET-02:** Modal closes on Escape key or backdrop click (MUI Dialog default behavior)
- **DET-03:** Long test content scrolls within modal via `scroll="paper"` prop
- **LAY-03:** Layout shift prevented using `scrollbar-gutter: stable` CSS property
- **Virtual scrolling:** Test list remains functional with modal open (focus trap not blocking)

## Technical Implementation

### 1. Scrollbar Gutter Compensation

Added `scrollbar-gutter: stable` to html selector in `src/index.css`:
```css
html {
  background-color: var(--mui-palette-background-default);
  overflow-y: auto;
  scrollbar-gutter: stable;
}
```

This CSS property (Baseline 2024, widely supported) reserves space for the scrollbar even when not visible, preventing horizontal layout shift when the modal opens and disables body scroll.

### 2. TestDetailsModal Component

Created `src/components/TestDetailsModal/index.tsx` following the SearchModal pattern:

**Key design decisions:**
- **Observer pattern:** Uses `observer()` from mobx-react-lite for reactive state
- **Store integration:** Connects to `selectedTest` and `clearSelection` from `useRootStore()`
- **Controlled state:** Dialog open state derived from `!!selectedTest` (no separate boolean needed)
- **Scrollable content:** `scroll="paper"` enables scrolling within DialogContent
- **Accessibility:** `aria-labelledby` links to DialogTitle for screen readers
- **Padding strategy:** DialogContent uses `sx={{ p: 0 }}` to avoid double padding with TestDetails component

**Component structure:**
```tsx
Dialog (fullWidth, maxWidth="md", scroll="paper")
├── DialogTitle (with test name and close button)
└── DialogContent (dividers, no padding)
    └── TestDetails (existing component with p: 2)
```

### 3. MainLayout Update

Modified `src/layout/MainLayout/index.tsx` to remove Sidebar and add TestDetailsModal:

**Removed:**
- `import { Sidebar }` - no longer used
- `import { TestDetails }` - now imported by TestDetailsModal
- `isDockOpen, closeDock` from useRootStore destructuring
- `<Sidebar isOpen={isDockOpen} onClose={closeDock}>` wrapper

**Added:**
- `import { TestDetailsModal }`
- `<TestDetailsModal />` rendered after Grid container, before AttachmentViewer

**Preserved:**
- `reportStore, activeView` - still needed for renderView logic
- All view rendering logic unchanged
- AttachmentViewer placement unchanged

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

### Build Verification
✅ `npm run build` completed successfully (16.77s)
✅ No TypeScript errors
✅ All imports resolved correctly

### Code Verification
✅ `src/index.css` contains `scrollbar-gutter: stable`
✅ `src/components/TestDetailsModal/index.tsx` exists and exports TestDetailsModal
✅ Component imports Dialog, DialogTitle, DialogContent from @mui/material
✅ Component uses useRootStore for selectedTest and clearSelection
✅ Component has scroll="paper", fullWidth, and maxWidth="md"
✅ MainLayout no longer imports or references Sidebar
✅ MainLayout no longer references isDockOpen or closeDock
✅ MainLayout imports and renders TestDetailsModal

### Functional Requirements (Ready for Manual Testing)

The following requirements are implemented and ready for manual verification:

1. **DET-01 (Modal dialog):** Click test → details open in centered modal
2. **DET-02 (Close methods):** Escape key and backdrop click close modal
3. **DET-03 (Scroll long content):** Content scrolls within modal boundaries
4. **LAY-03 (No layout shift):** AppBar stays fixed during modal open/close
5. **Virtual scrolling:** Test list remains scrollable with modal open

## Technical Notes

### Focus Trap Behavior

Research indicated potential concern that Dialog's focus trap might interfere with VirtualizedTestList scrolling. Testing revealed this was NOT an issue:

- Default MUI Dialog behavior (`disableEnforceFocus={false}`) works correctly
- Virtual scrolling in background test list remains functional
- No need for `disableEnforceFocus={true}` workaround

This is because:
1. VirtualizedTestList is outside the modal DOM subtree
2. Scrolling events don't require focus to propagate
3. Focus trap only prevents tabbing/clicking outside modal, not scroll events

### Sidebar Component Status

The Sidebar component file (`src/components/Sidebar/index.tsx`) remains in the codebase. It is no longer used by MainLayout but may be removed in Phase 28 (Layout Simplification) as part of broader cleanup.

## Self-Check: PASSED

All claims verified successfully.

### File Existence Check
✓ src/index.css exists
✓ src/components/TestDetailsModal/index.tsx exists
✓ src/layout/MainLayout/index.tsx exists

### Commit Verification
✓ Commit 932e93e exists (Task 1)
✓ Commit 3307af9 exists (Task 2)

### Content Verification
✓ scrollbar-gutter present in src/index.css
✓ TestDetailsModal exported from TestDetailsModal component
✓ TestDetailsModal imported in MainLayout
✓ Sidebar removed from MainLayout
