# Phase 14: Sidebar Navigation - Research

**Researched:** 2026-02-10
**Domain:** MUI Drawer component with persistent/permanent navigation patterns
**Confidence:** HIGH

## Summary

Phase 14 requires implementing a persistent left-side navigation sidebar with collapsible state that persists across sessions. MUI 5 provides the Drawer component with three variants: temporary, persistent, and permanent. For desktop navigation with collapse/expand functionality, the **permanent variant with mini variant pattern** is the standard approach.

The current project already has a right-side Drawer for test details (controlled by `isDockOpen` in RootStore). Phase 14 adds a **left-side navigation drawer** that is independent and persistent. The implementation requires: Drawer component with permanent variant, MobX store state for collapsed/expanded toggle, localStorage persistence, List/ListItem/ListItemButton components for navigation items, proper z-index coordination with existing AppBar, and layout shift handling for main content area.

**Primary recommendation:** Use MUI Drawer permanent variant with mini variant pattern (240px expanded, 64px collapsed), manage state in MobX RootStore with localStorage persistence, coordinate with existing AppBar using z-index and layout Box transitions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | 5.12.0 | Drawer, List, Box components | Already in project, official MUI components |
| @mui/icons-material | 5.18.0 | Navigation icons (Dashboard, Assessment, Menu, ChevronLeft/Right) | Already in project, Material Design icons |
| mobx | 6.9.0 | UI state management (collapsed/expanded) | Already in project for all state |
| mobx-react-lite | 3.4.3 | observer() wrapper for reactive components | Already in project pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage | Browser API | Persist drawer state across sessions | Session persistence requirement NAV-02 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Permanent Drawer | Persistent Drawer | Persistent requires open/close, permanent is always visible (better for desktop) |
| MobX | useState + useEffect | MobX already used throughout project, consistent pattern |
| localStorage | sessionStorage | sessionStorage clears on tab close, doesn't persist across sessions |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── NavigationDrawer/    # New left-side navigation drawer
│   │   └── index.tsx
│   └── Sidebar/              # Existing right-side test details drawer
│       └── index.tsx
├── layout/
│   └── MainLayout/           # Update to accommodate left drawer
│       └── index.tsx
└── store/
    └── index.tsx             # Add navigation state to RootStore
```

### Pattern 1: Permanent Drawer with Mini Variant
**What:** Drawer always visible, collapses to icon-only mode (64px) or expands to full width (240px)
**When to use:** Desktop navigation that should be always accessible but space-efficient

**Example:**
```typescript
// Common pattern from MUI examples and community
// Source: Multiple MUI GitHub examples

const DRAWER_WIDTH_EXPANDED = 240
const DRAWER_WIDTH_COLLAPSED = 64

// In store
class RootStore {
  isNavigationCollapsed = false

  toggleNavigation = () => {
    this.isNavigationCollapsed = !this.isNavigationCollapsed
    localStorage.setItem('navigationCollapsed', JSON.stringify(this.isNavigationCollapsed))
  }

  // Load state on init
  loadNavigationState = () => {
    const stored = localStorage.getItem('navigationCollapsed')
    if (stored) {
      this.isNavigationCollapsed = JSON.parse(stored)
    }
  }
}

// In component
<Drawer
  variant="permanent"
  sx={{
    width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
      boxSizing: 'border-box',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: collapsed
          ? theme.transitions.duration.leavingScreen
          : theme.transitions.duration.enteringScreen,
      }),
      overflowX: 'hidden',
    },
  }}
>
  {/* Navigation items */}
</Drawer>
```

### Pattern 2: Navigation List with Active Highlighting
**What:** List of navigation items with visual indication of current active view
**When to use:** Any navigation menu requiring active state indication

**Example:**
```typescript
// Source: MUI List documentation and common patterns

<List>
  <ListItem disablePadding>
    <ListItemButton
      selected={activeView === 'dashboard'}
      onClick={() => handleNavigate('dashboard')}
      sx={{
        minHeight: 48,
        justifyContent: collapsed ? 'center' : 'initial',
        px: 2.5,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: collapsed ? 'auto' : 3,
          justifyContent: 'center',
        }}
      >
        <DashboardIcon />
      </ListItemIcon>
      {!collapsed && <ListItemText primary="Dashboard" />}
    </ListItemButton>
  </ListItem>
</List>
```

### Pattern 3: Layout Coordination with AppBar and Main Content
**What:** Coordinate z-index and spacing between AppBar, Drawer, and main content
**When to use:** When adding permanent drawer to existing AppBar layout

**Example:**
```typescript
// Source: MUI documentation z-index coordination patterns

// In App.tsx
<AppBar
  position="fixed"
  sx={{
    zIndex: theme => theme.zIndex.drawer + 1, // Above drawer
    width: `calc(100% - ${drawerWidth}px)`,
    ml: `${drawerWidth}px`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }}
>
  <Toolbar>...</Toolbar>
</AppBar>

// Main content
<Box
  component="main"
  sx={{
    flexGrow: 1,
    p: 3,
    ml: collapsed ? `${DRAWER_WIDTH_COLLAPSED}px` : `${DRAWER_WIDTH_EXPANDED}px`,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }}
>
  {/* Content */}
</Box>
```

### Pattern 4: localStorage Persistence Hook Pattern
**What:** Load state from localStorage on mount, save on change
**When to use:** UI state that should persist across browser sessions

**Example:**
```typescript
// In RootStore constructor
constructor() {
  // ... existing stores
  makeAutoObservable(this)

  // Load navigation state from localStorage
  const stored = localStorage.getItem('navigationCollapsed')
  if (stored !== null) {
    try {
      this.isNavigationCollapsed = JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse navigation state from localStorage')
    }
  }
}

// In toggle action
toggleNavigation = () => {
  this.isNavigationCollapsed = !this.isNavigationCollapsed
  localStorage.setItem('navigationCollapsed', JSON.stringify(this.isNavigationCollapsed))
}
```

### Anti-Patterns to Avoid

- **Using persistent/temporary variant for desktop navigation:** These variants require open/close state and don't support mini variant collapse properly - use permanent variant instead
- **Forgetting Toolbar spacer in Drawer:** Without `<Toolbar />` at top of Drawer content, navigation items will overlap with AppBar
- **Not coordinating z-index:** AppBar must be `zIndex.drawer + 1` to appear above Drawer paper
- **Animating too many properties:** Only animate `width` and `margin` for smooth performance - avoid animating all properties
- **Direct localStorage access in components:** Centralize in store to avoid sync issues across components

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drawer animation/transitions | Custom CSS transitions | theme.transitions.create() | MUI theme provides coordinated easing curves and durations optimized for Material Design |
| Navigation state management | Custom useState + Context | MobX store (already in project) | Consistent with existing patterns, prevents state duplication |
| Active route tracking | Custom route matching logic | Simple view state in store | No routing library in project, state-based view switching is simpler |
| Icon-only collapsed state | Manual hide/show of text | ListItemIcon + conditional ListItemText | Standard MUI pattern with proper spacing and alignment |
| localStorage persistence | Custom storage abstraction | Direct localStorage with error handling | Simple requirement, abstraction adds complexity without benefit |
| Responsive drawer width | Media query CSS | theme.transitions.create('width') with state | Smooth animations better UX than instant breakpoint changes |

**Key insight:** MUI Drawer with permanent variant handles 90% of the complexity (positioning, scrolling, elevation, accessibility). Focus on state management and layout coordination, not drawer mechanics.

## Common Pitfalls

### Pitfall 1: Z-Index Conflicts with Modals
**What goes wrong:** If AppBar z-index equals or is less than Drawer, and Drawer equals Modal, stacking order breaks. Existing right-side Drawer for test details could conflict.
**Why it happens:** MUI's Drawer uses Modal component internally with z-index 1300. AppBar default is 1100, Drawer default is 1200.
**How to avoid:** Set AppBar to `theme.zIndex.drawer + 1` (1201) to ensure it's above navigation Drawer. Verify right-side Drawer (Sidebar) doesn't conflict - it uses temporary variant which should render above permanent navigation Drawer.
**Warning signs:** AppBar title overlaps with Drawer paper, or right-side Drawer appears behind navigation Drawer.

### Pitfall 2: Layout Shift Without Transition
**What goes wrong:** Main content jumps instantly when drawer collapses/expands instead of smooth animation
**Why it happens:** Forgot to add transition to main content Box margin/padding, or used wrong easing/duration
**How to avoid:** Use `theme.transitions.create(['margin', 'width'], {...})` on main content Box with matching duration to Drawer. Use `leavingScreen` duration when collapsing, `enteringScreen` when expanding.
**Warning signs:** Content jumps or feels jarring when toggling drawer state

### Pitfall 3: localStorage Hydration Issues
**What goes wrong:** Drawer flashes wrong state on page load, or localStorage parsing throws errors
**Why it happens:** Reading localStorage in wrong lifecycle phase, or stored value is corrupted/wrong type
**How to avoid:** Read localStorage in store constructor (synchronous, before first render). Wrap JSON.parse in try-catch. Use JSON.stringify/parse for booleans to avoid string 'false' truthy issue.
**Warning signs:** Console errors about JSON parsing, drawer state resets to default on every page load despite localStorage having value

### Pitfall 4: Navigation State Not Accessible
**What goes wrong:** Can't track which view is active, or active state doesn't update
**Why it happens:** Forgot to add `activeView` state to RootStore, or components don't update when activeView changes
**How to avoid:** Add observable `activeView` property to RootStore, wrap navigation components with `observer()`, use `selected={activeView === 'dashboard'}` prop on ListItemButton
**Warning signs:** All navigation items look the same, can't tell which view is active

### Pitfall 5: Forgot to Update MainLayout Content Area
**What goes wrong:** Main content still spans full width, overlaps with navigation drawer
**Why it happens:** Existing MainLayout uses Grid without accounting for permanent drawer taking left space
**How to avoid:** Replace Grid layout with Box flex layout, add left margin equal to drawer width, apply transition to margin
**Warning signs:** Navigation drawer overlaps content, clicking dashboard/tests doesn't show different content

### Pitfall 6: Icon Alignment in Collapsed State
**What goes wrong:** Icons don't center properly when drawer is collapsed to icon-only mode
**Why it happens:** ListItemIcon `mr` (margin-right) prop not conditional on collapsed state
**How to avoid:** Set `justifyContent: collapsed ? 'center' : 'initial'` on ListItemButton, conditional `mr: collapsed ? 'auto' : 3` on ListItemIcon
**Warning signs:** Icons look off-center or too far left when drawer collapsed

### Pitfall 7: Missing Accessibility Labels
**What goes wrong:** Screen readers can't identify navigation region or current page
**Why it happens:** Forgot `aria-label` on nav, forgot `aria-current="page"` on active item
**How to avoid:** Add `aria-label="main navigation"` to Drawer, add `aria-current="page"` to selected ListItemButton
**Warning signs:** Screen reader testing shows poor navigation identification

## Code Examples

Verified patterns from official sources:

### MUI Drawer with Width Transition
```typescript
// Source: MUI Drawer examples pattern (multiple GitHub examples)
const DRAWER_WIDTH_EXPANDED = 240
const DRAWER_WIDTH_COLLAPSED = 64

<Drawer
  variant="permanent"
  sx={{
    width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
      boxSizing: 'border-box',
      transition: theme => theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: collapsed
          ? theme.transitions.duration.leavingScreen
          : theme.transitions.duration.enteringScreen,
      }),
      overflowX: 'hidden', // Hide scrollbar during transition
    },
  }}
  open
>
  <Toolbar /> {/* Spacer for AppBar */}
  {/* Content */}
</Drawer>
```

### Navigation List Item with Active State
```typescript
// Source: MUI List documentation - selected prop pattern
<ListItem disablePadding>
  <ListItemButton
    selected={activeView === 'dashboard'}
    onClick={() => handleNavigate('dashboard')}
    aria-current={activeView === 'dashboard' ? 'page' : undefined}
  >
    <ListItemIcon>
      <DashboardIcon />
    </ListItemIcon>
    <ListItemText primary="Dashboard" />
  </ListItemButton>
</ListItem>
```

### Theme Transitions Helper
```typescript
// Source: MUI theme transitions documentation
// https://mui.com/material-ui/customization/transitions/

// In sx prop or styled()
transition: theme => theme.transitions.create(['margin', 'width'], {
  easing: theme.transitions.easing.sharp,
  duration: theme.transitions.duration.enteringScreen, // 225ms
})

// For leaving screen (collapse)
transition: theme => theme.transitions.create(['margin', 'width'], {
  easing: theme.transitions.easing.sharp,
  duration: theme.transitions.duration.leavingScreen, // 195ms
})
```

### MobX Observable State Pattern
```typescript
// Source: MobX documentation - makeAutoObservable pattern
// https://mobx.js.org/observable-state.html

class RootStore {
  isNavigationCollapsed = false
  activeView: 'dashboard' | 'tests' | 'analytics' = 'dashboard'

  constructor() {
    // ... other stores
    makeAutoObservable(this)
    this.loadNavigationState()
  }

  toggleNavigation = () => {
    this.isNavigationCollapsed = !this.isNavigationCollapsed
    localStorage.setItem('navigationCollapsed', JSON.stringify(this.isNavigationCollapsed))
  }

  setActiveView = (view: 'dashboard' | 'tests' | 'analytics') => {
    this.activeView = view
  }

  private loadNavigationState = () => {
    const stored = localStorage.getItem('navigationCollapsed')
    if (stored !== null) {
      try {
        this.isNavigationCollapsed = JSON.parse(stored)
      } catch (e) {
        console.warn('Failed to parse navigation state')
      }
    }
  }
}
```

### Layout Coordination Pattern
```typescript
// Source: Common MUI layout pattern for drawer + appbar coordination

<Box sx={{ display: 'flex' }}>
  <AppBar
    position="fixed"
    sx={{
      zIndex: theme => theme.zIndex.drawer + 1, // Above drawer
    }}
  >
    <Toolbar variant="dense">
      <IconButton onClick={toggleNavigation}>
        <MenuIcon />
      </IconButton>
      <Box sx={{ flexGrow: 1 }}>Qase | Report</Box>
      <ThemeToggle />
    </Toolbar>
  </AppBar>

  <NavigationDrawer collapsed={collapsed} onToggle={toggleNavigation} />

  <Box
    component="main"
    sx={{
      flexGrow: 1,
      p: 2,
      ml: collapsed ? `${DRAWER_WIDTH_COLLAPSED}px` : `${DRAWER_WIDTH_EXPANDED}px`,
      mt: '48px', // AppBar height (dense toolbar)
      transition: theme => theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    }}
  >
    {/* Existing MainLayout content */}
  </Box>
</Box>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Persistent Drawer for desktop | Permanent Drawer with mini variant | MUI v4+ | Always visible, no open/close state needed, simpler |
| useState in components | MobX store | Project from start | Centralized state, consistent with project patterns |
| CSS classes for transitions | theme.transitions.create() | MUI v5+ | Theme-aware timing, consistent with other MUI components |
| Manual icon centering | justifyContent conditional | Common pattern evolution | Proper alignment without custom positioning |
| sessionStorage | localStorage | Modern standard | True persistence across sessions and browser restarts |

**Deprecated/outdated:**
- Persistent/temporary Drawer for desktop navigation - use permanent variant instead
- makeObservable with explicit annotations - use makeAutoObservable for simpler code
- Manual transition timing values - use theme.transitions.duration constants

## Open Questions

1. **Should navigation drawer include "Analytics" view now or defer to future phase?**
   - What we know: Phase 14 requirements list Dashboard, Tests, Analytics as sections
   - What's unclear: Analytics phase hasn't been implemented yet (future phase)
   - Recommendation: Include Analytics navigation item but disable/gray out with tooltip "Coming soon" - establishes complete navigation structure without implementation complexity

2. **Should collapsed state apply only to desktop or also to mobile?**
   - What we know: Permanent drawer is desktop pattern, mobile typically uses temporary drawer
   - What's unclear: No explicit mobile requirements in Phase 14
   - Recommendation: Desktop-only implementation with permanent drawer, defer mobile responsive behavior to future phase if needed

3. **How should navigation integrate with existing view switching?**
   - What we know: MainLayout currently shows Dashboard and TestList based on reportStore.runData
   - What's unclear: Should navigation completely replace this logic or coordinate with it?
   - Recommendation: Add `activeView` state to RootStore, navigation sets this state, MainLayout conditionally renders based on activeView instead of runData checks

## Sources

### Primary (HIGH confidence)
- [MUI Drawer Component Documentation](https://mui.com/material-ui/react-drawer/) - Drawer variants, permanent/persistent/temporary patterns
- [MUI Drawer API Reference](https://mui.com/material-ui/api/drawer/) - Props and configuration
- [MUI Transitions Documentation](https://mui.com/material-ui/customization/transitions/) - theme.transitions.create() API, duration and easing constants
- [MUI z-index Documentation](https://mui.com/material-ui/customization/z-index/) - Default z-index values and coordination
- [MUI List Component Documentation](https://mui.com/material-ui/react-list/) - List, ListItem, ListItemButton patterns
- [MUI ListItemButton API](https://mui.com/material-ui/api/list-item-button/) - selected prop and active state
- [MUI Material Icons](https://mui.com/material-ui/material-icons/) - Available navigation icons
- [MobX Observable State](https://mobx.js.org/observable-state.html) - makeAutoObservable pattern
- [MobX GitHub Repository](https://github.com/mobxjs/mobx) - Official MobX documentation

### Secondary (MEDIUM confidence)
- [Josh Comeau - Persisting React State in localStorage](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - localStorage best practices, SSR hydration issues
- [LogRocket - Using localStorage with React Hooks](https://blog.logrocket.com/using-localstorage-react-hooks/) - Patterns and pitfalls
- [MDN ARIA navigation role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/navigation_role) - Accessibility guidelines
- [MDN ARIA aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) - Active page indication
- [Kombai - React MUI Drawer Tutorial](https://kombai.com/mui/drawer/) - Responsive sidebar patterns
- [GeeksforGeeks - React MUI Drawer Navigation](https://www.geeksforgeeks.org/react-mui-drawer-navigation/) - Implementation examples
- [MUI GitHub Issue #29878](https://github.com/mui/material-ui/issues/29878) - z-index drawer and modal conflicts
- [MUI GitHub Issue #26580](https://github.com/mui/material-ui/issues/26580) - z-index coordination patterns

### Tertiary (LOW confidence)
- Various MUI GitHub issues showing `const drawerWidth = 240` pattern - community consensus on standard width values

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, MUI Drawer is official solution
- Architecture: HIGH - Permanent drawer with mini variant is documented MUI pattern, MobX integration follows project conventions
- Pitfalls: MEDIUM-HIGH - Z-index conflicts well-documented, localStorage patterns verified, layout shift patterns common in MUI examples

**Research date:** 2026-02-10
**Valid until:** ~30 days (stable MUI 5 API, no breaking changes expected)
