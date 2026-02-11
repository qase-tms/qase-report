# Phase 27: Modal Test Details - Research

**Researched:** 2026-02-11
**Domain:** MUI Dialog modal implementation with react-window virtual scrolling
**Confidence:** HIGH

## Summary

Phase 27 requires implementing a modal dialog for test details that doesn't interfere with the existing react-window virtual scrolling. The project already uses MUI Dialog in SearchModal and TextViewer components, establishing a pattern to follow. The critical research flag about Dialog focus trap interfering with virtual scrolling is a known but manageable concern.

**Key findings:**
- MUI Dialog (already in use: @mui/material 5.12.0) supports all required features out-of-the-box
- Dialog focus trap can be disabled with `disableEnforceFocus={true}` if it interferes with react-window scrolling
- Modern CSS `scrollbar-gutter: stable` (Baseline 2024) prevents layout shift when modal opens
- TestDetails component already exists and can be wrapped in Dialog with minimal changes
- Existing codebase pattern: SearchModal uses Dialog with same store pattern needed for this phase

**Primary recommendation:** Use MUI Dialog with scroll="paper" (scrolling within dialog), test with existing VirtualizedTestList first, add `disableEnforceFocus={true}` only if focus trap prevents list scrolling.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | 5.12.0 | Dialog component | Already in project, established pattern in SearchModal and TextViewer |
| react-window | 1.8.11 | Virtual scrolling | Already implemented in VirtualizedTestList (Phase 17) |
| mobx-react-lite | 3.4.3 | State management | RootStore pattern already handles modal state (isDockOpen, selectedTestId) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mui/material/useMediaQuery | 5.12.0 | Responsive breakpoints | Optional: for fullScreen on mobile (not in requirements) |
| @mui/icons-material | 5.18.0 | CloseIcon | Already used in TestDetails component |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dialog | Drawer | Already using Drawer (Sidebar) - Dialog provides better modal UX for requirements |
| Dialog | Native HTML `<dialog>` | Native has better browser support (2024+) but MUI theme integration needed |
| scroll="paper" | scroll="body" | scroll="body" scrolls entire dialog, worse UX for fixed header/actions |

**Installation:**
No installation needed - all dependencies already in package.json.

## Architecture Patterns

### Recommended Component Structure
```
src/components/TestDetailsModal/
├── index.tsx              # Dialog wrapper with state management
```

Or inline pattern (following SearchModal):
```
src/layout/MainLayout/index.tsx  # Add Dialog directly in render
```

### Pattern 1: Dialog Modal State Management (Existing Pattern)
**What:** RootStore controls modal open/close state, Dialog renders based on store observables
**When to use:** For modals that display entity details from store
**Example:**
```typescript
// Source: src/components/SearchModal/index.tsx (existing codebase)
export const SearchModal = observer(({ open, onClose }: SearchModalProps) => {
  const root = useRootStore()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      {/* content */}
    </Dialog>
  )
})

// Usage in MainLayout
const root = useRootStore()
<SearchModal open={root.isSearchOpen} onClose={root.closeSearch} />
```

### Pattern 2: Dialog with Scrollable Content
**What:** Use scroll="paper" to scroll within DialogContent, keeping DialogTitle and DialogActions fixed
**When to use:** When dialog content can be long (test details, stacktraces, steps)
**Example:**
```typescript
// Source: https://mui.com/material-ui/react-dialog/ (official docs)
<Dialog
  open={open}
  onClose={handleClose}
  scroll="paper"
  maxWidth="md"
  fullWidth
  aria-labelledby="test-details-title"
  aria-describedby="test-details-description"
>
  <DialogTitle id="test-details-title">Test Details</DialogTitle>
  <DialogContent dividers>
    {/* Scrollable content here - TestDetails component */}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Close</Button>
  </DialogActions>
</Dialog>
```

### Pattern 3: Focus Trap with Virtual Scrolling (Critical Pattern)
**What:** Dialog's focus trap may prevent react-window list from scrolling outside the modal
**When to use:** When background has virtual scrolled list that needs to remain scrollable
**Example:**
```typescript
// Source: Research findings from https://mui.com/material-ui/react-modal/ and GitHub issues
// OPTION 1: Test first without disableEnforceFocus
<Dialog
  open={open}
  onClose={onClose}
>
  {/* Test if VirtualizedTestList scrolls with modal open */}
</Dialog>

// OPTION 2: If focus trap blocks scrolling, disable it
<Dialog
  open={open}
  onClose={onClose}
  disableEnforceFocus={true}  // Allows background interaction
  disableAutoFocus={true}      // Don't auto-focus first element
>
  {/* VirtualizedTestList can now scroll */}
</Dialog>
```

### Pattern 4: Prevent Layout Shift (Scrollbar Compensation)
**What:** Use CSS scrollbar-gutter to prevent page shift when modal opens and removes scrollbar
**When to use:** Always, to meet LAY-03 requirement
**Example:**
```css
/* Source: https://web.dev/blog/baseline-scrollbar-props (Baseline 2024) */
/* Add to global styles or theme */
html {
  overflow-y: auto;
  scrollbar-gutter: stable; /* Reserves space for scrollbar even when hidden */
}
```

### Pattern 5: Keyboard Shortcuts (Escape Key)
**What:** Dialog automatically closes on Escape by default, can be disabled with disableEscapeKeyDown
**When to use:** Default behavior meets DET-02 requirement
**Example:**
```typescript
// Source: https://mui.com/material-ui/react-dialog/ (official docs)
// Default behavior - no props needed
<Dialog open={open} onClose={onClose}>
  {/* Escape key calls onClose automatically */}
</Dialog>

// To disable (not needed for this phase):
<Dialog open={open} onClose={onClose} disableEscapeKeyDown>
  {/* Escape key won't close */}
</Dialog>
```

### Pattern 6: Click Outside to Close
**What:** Dialog calls onClose when backdrop is clicked, can be prevented by checking reason parameter
**When to use:** Default behavior meets DET-02 requirement
**Example:**
```typescript
// Source: https://github.com/mui/material-ui/issues/40514 (GitHub issues)
// Allow backdrop click (default)
const handleClose = () => {
  root.clearSelection() // Clears selectedTestId and closes modal
}

<Dialog open={open} onClose={handleClose}>
  {/* Clicking backdrop calls handleClose */}
</Dialog>

// Prevent backdrop click (if needed later):
const handleClose = (event: object, reason: string) => {
  if (reason === 'backdropClick') return
  root.clearSelection()
}
```

### Anti-Patterns to Avoid
- **Don't use disableEnforceFocus without testing first:** May break keyboard accessibility unnecessarily
- **Don't use scroll="body":** Creates poor UX where dialog title scrolls off-screen
- **Don't forget aria-labelledby/aria-describedby:** Required for screen reader accessibility
- **Don't use disableScrollLock:** MUI v5.12+ handles this correctly by default
- **Don't reimplement TestDetails component:** Already exists at src/components/TestDetails/index.tsx

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trap management | Custom event listeners for focus containment | MUI Dialog's built-in focus trap | Handles edge cases: Tab key cycling, screen readers, nested portals |
| Scrollbar compensation | Custom padding calculation on body | CSS scrollbar-gutter: stable | Browser-native, handles overlay scrollbars (macOS), no JS needed |
| Escape key handling | Custom keydown listener | Dialog's disableEscapeKeyDown prop (default false) | Handles nested dialogs, IME input, composing state |
| Backdrop click detection | Custom overlay element with click handler | Dialog's onClose with reason parameter | Handles propagation, portal boundaries, mobile touch |
| Modal state management | Custom context or prop drilling | Existing RootStore.selectedTestId pattern | Already integrated with Sidebar (Drawer) pattern |
| Responsive fullscreen | Custom window.innerWidth listeners | useMediaQuery hook (optional enhancement) | Syncs with MUI theme breakpoints, SSR-safe |

**Key insight:** MUI Dialog is a production-hardened component that handles complex accessibility and browser edge cases. Custom implementations miss crucial behaviors like focus restoration, screen reader announcements, and browser-specific quirks.

## Common Pitfalls

### Pitfall 1: Focus Trap Blocks Virtual List Scrolling
**What goes wrong:** When Dialog opens with default focus trap, clicking on VirtualizedTestList in background may not scroll the list, or focus returns to modal immediately
**Why it happens:** Dialog's FocusTrap component enforces focus containment by default, moving focus back to modal content when user tries to interact with background
**How to avoid:**
1. **Test first:** Open Dialog and verify VirtualizedTestList scrolling behavior in background
2. **If blocked:** Add `disableEnforceFocus={true}` to Dialog props
3. **Trade-off:** This allows background interaction but reduces modal "modality" - acceptable for this use case per research flag
**Warning signs:** User clicks list in background but nothing happens, or focus jumps back to modal

### Pitfall 2: Layout Shift When Modal Opens
**What goes wrong:** When Dialog opens, page content shifts right by ~15px as scrollbar disappears, then shifts back when Dialog closes
**Why it happens:** Dialog adds `overflow: hidden` to body, removing scrollbar and releasing reserved space
**How to avoid:** Add `html { scrollbar-gutter: stable; }` to global styles (Baseline 2024 browser support)
**Warning signs:** AppBar or content "jumps" horizontally when opening/closing modal, user notices visual flicker

### Pitfall 3: TestDetails Component Padding Conflicts
**What goes wrong:** TestDetails component has `sx={{ p: 2 }}` wrapper, DialogContent also has padding, creating double padding
**Why it happens:** TestDetails was designed for Sidebar (Drawer), which doesn't have DialogContent padding
**How to avoid:**
- **Option 1:** Wrap TestDetails content only (not outer Box) in DialogContent
- **Option 2:** Pass `sx={{ p: 0 }}` to DialogContent and keep TestDetails padding
- **Option 3:** Extract TestDetails inner content to shared component
**Warning signs:** Excessive whitespace around test details in modal compared to sidebar

### Pitfall 4: Missing Accessibility Attributes
**What goes wrong:** Screen readers announce "Dialog" without context about what the dialog contains
**Why it happens:** Dialog needs aria-labelledby and aria-describedby to connect to DialogTitle and content
**How to avoid:** Always add matching id/aria attributes:
```typescript
<Dialog
  aria-labelledby="test-details-title"
  aria-describedby="test-details-content"
>
  <DialogTitle id="test-details-title">Test Details</DialogTitle>
  <DialogContent id="test-details-content">...</DialogContent>
</Dialog>
```
**Warning signs:** Screen reader testing reveals unclear dialog announcements

### Pitfall 5: Modal State Conflicts with Sidebar (Drawer)
**What goes wrong:** Both Sidebar (Drawer) and Dialog use same store state (isDockOpen, selectedTestId), creating conflicts
**Why it happens:** Phase 27 goal is to *replace* Drawer with Dialog, but migration approach not clear
**How to avoid:**
1. **Research finding:** Requirements say "modal dialog (not separate page)" - implies Dialog should replace Drawer
2. **However:** Drawer is desktop-optimized, Dialog is modal - consider responsive pattern
3. **Recommendation:** Phase 27 should clarify if this replaces Drawer entirely or adds alternative
**Warning signs:** Opening Dialog also opens Drawer, or state gets out of sync

### Pitfall 6: Long Test Content Doesn't Scroll in Dialog
**What goes wrong:** Dialog is taller than viewport, content is cut off, scrolling doesn't work
**Why it happens:** DialogContent needs explicit maxHeight or Dialog needs height constraints
**How to avoid:**
- Use `scroll="paper"` prop on Dialog
- Add `dividers` prop to DialogContent (adds top/bottom borders when scrolling)
- Set maxHeight on DialogContent: `sx={{ maxHeight: 'calc(100vh - 200px)' }}`
**Warning signs:** Long stacktraces or many test steps are cut off without scrollbar

## Code Examples

Verified patterns from official sources and existing codebase:

### Example 1: Basic Dialog Setup (Following SearchModal Pattern)
```typescript
// Source: Existing pattern from src/components/SearchModal/index.tsx
import { observer } from 'mobx-react-lite'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useRootStore } from '../../store'
import { TestDetails } from '../../components/TestDetails'

export const TestDetailsModal = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  return (
    <Dialog
      open={!!selectedTest}
      onClose={clearSelection}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="test-details-title"
    >
      <DialogTitle id="test-details-title">Test Details</DialogTitle>
      <DialogContent dividers>
        <TestDetails />
      </DialogContent>
      <DialogActions>
        <Button onClick={clearSelection}>Close</Button>
      </DialogActions>
    </Dialog>
  )
})
```

### Example 2: Dialog with Focus Trap Disabled (If Needed)
```typescript
// Source: https://mui.com/material-ui/react-modal/ + research findings
// Use ONLY if testing confirms focus trap blocks VirtualizedTestList scrolling
<Dialog
  open={!!selectedTest}
  onClose={clearSelection}
  maxWidth="md"
  fullWidth
  disableEnforceFocus={true}  // Allows background VirtualizedTestList to scroll
  disableAutoFocus={true}      // Prevents auto-focus on first element
  scroll="paper"
>
  {/* content */}
</Dialog>
```

### Example 3: Integration into MainLayout
```typescript
// Source: Existing pattern from src/layout/MainLayout/index.tsx
export const MainLayout = observer(() => {
  const { isDockOpen, closeDock, selectedTest, clearSelection } = useRootStore()

  return (
    <>
      <Grid container>
        {/* Main content with VirtualizedTestList */}
      </Grid>

      {/* Replace Sidebar with Dialog */}
      <Dialog
        open={!!selectedTest}
        onClose={clearSelection}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogContent>
          <TestDetails />
        </DialogContent>
      </Dialog>

      {/* Keep AttachmentViewer as global modal */}
      <AttachmentViewer />
    </>
  )
})
```

### Example 4: Prevent Layout Shift with Scrollbar Gutter
```css
/* Source: https://web.dev/blog/baseline-scrollbar-props (Baseline 2024) */
/* Add to src/index.css or theme globalStyles */
html {
  overflow-y: auto;
  scrollbar-gutter: stable; /* Reserve space for scrollbar */
}

/* Or with @supports for progressive enhancement */
@supports (scrollbar-gutter: stable) {
  html {
    scrollbar-gutter: stable;
  }
}
```

### Example 5: Responsive Dialog (Optional Enhancement)
```typescript
// Source: https://mui.com/material-ui/react-dialog/ (official docs)
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export const TestDetailsModal = observer(() => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Dialog
      fullScreen={fullScreen}  // Full screen on mobile
      maxWidth="md"
      fullWidth
    >
      {/* content */}
    </Dialog>
  )
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Drawer for details | Dialog modal | Phase 27 (this phase) | More standard modal UX, better mobile support |
| Custom scrollbar padding | CSS scrollbar-gutter | Baseline 2024 | Browser-native, no JS needed |
| Manual focus trap | MUI FocusTrap | MUI v5+ | Handles accessibility edge cases |
| react-modal library | Native `<dialog>` or MUI Dialog | 2024+ | Native browser support or theme integration |

**Deprecated/outdated:**
- **disableBackdropClick prop:** Removed in MUI v5, use `onClose={(e, reason) => reason !== 'backdropClick'}` instead
- **disableScrollLock prop:** Works but not needed in MUI v5.12+ (auto-handled correctly)
- **Manual overflow: hidden on body:** MUI Dialog handles this automatically

## Open Questions

1. **Should Dialog replace Drawer (Sidebar) entirely?**
   - What we know: Phase 27 says "modal dialog (not separate page)", Drawer currently shows TestDetails
   - What's unclear: Is this a replacement or an addition? What about users who prefer side panel?
   - Recommendation: Phase 27 should replace Drawer with Dialog for consistency. If side panel is desired, that should be a separate phase with responsive pattern (Drawer on desktop, Dialog on mobile)

2. **What happens to RootStore.isDockOpen and openDock/closeDock methods?**
   - What we know: These control Sidebar (Drawer), Dialog would use selectedTest directly
   - What's unclear: Should these be removed or repurposed?
   - Recommendation: Remove isDockOpen state and methods, use `!!selectedTest` directly for Dialog open state

3. **How should focus trap testing be approached?**
   - What we know: Research flag says "create prototype to verify", but no prototype exists yet
   - What's unclear: Should prototype be separate task, or test during implementation?
   - Recommendation: Add prototype task in PLAN: "Create minimal Dialog with VirtualizedTestList, test scroll behavior before full implementation"

## Sources

### Primary (HIGH confidence)
- [MUI Dialog Documentation](https://mui.com/material-ui/react-dialog/) - Official component docs
- [MUI Dialog API Reference](https://mui.com/material-ui/api/dialog/) - Props reference
- [MUI Modal Documentation](https://mui.com/material-ui/react-modal/) - Modal base component docs
- Existing codebase: src/components/SearchModal/index.tsx - Established Dialog pattern
- Existing codebase: src/components/TestDetails/index.tsx - Component to wrap
- Existing codebase: src/store/index.tsx - State management pattern

### Secondary (MEDIUM confidence)
- [React Dialog component - Material UI](https://mui.com/material-ui/react-dialog/) - General patterns
- [Media queries in React for responsive design - Material UI](https://mui.com/material-ui/react-use-media-query/) - useMediaQuery hook
- [CSS scrollbar-gutter Property - web.dev](https://web.dev/blog/baseline-scrollbar-props) - Baseline 2024 status
- [scrollbar-gutter - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter) - Browser support
- [Modal vs Drawer — When to use the right component](https://medium.com/@ninad.kotasthane/modal-vs-drawer-when-to-use-the-right-component-af0a76b952da) - Design patterns
- [Building the Perfect React Modal: From Portals to Accessibility](https://medium.com/@dlrnjstjs/building-the-perfect-react-modal-from-portals-to-accessibility-a567006ae169) - Accessibility patterns

### Tertiary (LOW confidence - needs validation)
- [GitHub Issue #39356: Dialog disableEnforceFocus prop not working in Electron App](https://github.com/mui/material-ui/issues/39356) - Edge case awareness
- [GitHub Issue #6656: Dialogs cause scrollbar disappear/reappear](https://github.com/mui/material-ui/issues/6656) - Layout shift issue history
- [GitHub Issue #9158: Dialog Screen reader best practices](https://github.com/mui/material-ui/issues/9158) - Accessibility discussion
- [ARIA: dialog role - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role) - Accessibility standards

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, versions verified in package.json
- Architecture: HIGH - Existing Dialog pattern in SearchModal, TestDetails exists, MobX store pattern established
- Pitfalls: MEDIUM-HIGH - Focus trap issue is documented concern, scrollbar-gutter is Baseline 2024 (verified), other pitfalls from community experience

**Research date:** 2026-02-11
**Valid until:** 2026-03-13 (30 days - stable libraries and patterns)

**Critical notes for planner:**
1. Focus trap prototype task should be FIRST task in plan (verify before building)
2. scrollbar-gutter CSS should be in global styles task, not Dialog implementation
3. Decision needed: Replace Drawer entirely or keep both? (Affects state management tasks)
4. TestDetails component may need refactoring to work in both Sidebar and Dialog (or choose one)
