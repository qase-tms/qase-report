# Technology Stack: Layout Simplification

**Project:** Qase Report — Layout Simplification (Hamburger Menu, Modal Test Details, Persistent Status Bar)
**Researched:** 2026-02-11
**Scope:** Stack requirements for NEW layout features (navigation hamburger, test details modal, persistent top bar status)
**Confidence:** HIGH

## Executive Summary

**ZERO new dependencies needed.** All features buildable with existing MUI 5 primitives:
- **Hamburger dropdown menu** → MUI `Menu` + `IconButton` (already have both)
- **Modal test details** → MUI `Dialog` with scrollable content (built-in)
- **Persistent status bar** → AppBar composition with `Chip`, `Box`, `Toolbar` (already have all)

MobX state management already tracks modal state (`isDockOpen`, `selectedTestId`). No state machine library needed. Refactor existing components to use native MUI APIs instead of custom Drawer wrapping.

**Bundle impact: +0KB.** No additions to package.json.

---

## Feature Implementation with Existing Stack

### 1. Hamburger Menu (Dropdown Navigation)

**Current state:** Permanent left NavigationDrawer (collapsible to icon-only)

**New approach:** Replace with hamburger menu button in AppBar → Menu dropdown

**Solution Components:**
```typescript
// MUI components (ALREADY IN @mui/material@5.12.0)
import {
  IconButton,              // Button container for menu trigger
  Menu,                    // Dropdown menu surface
  MenuItem,                // Menu items with click handlers
  ListItemIcon,            // Icon next to text
  ListItemText,            // Text label
  Divider,                 // Visual separator
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'  // Hamburger icon
```

**Why MUI Menu over alternatives:**
| Option | Bundle | Rationale | Chosen |
|--------|--------|-----------|--------|
| MUI Menu | 0KB (built-in) | Material Design dropdown, proper a11y | ✓ YES |
| Headless UI Radix | +8KB | Unstyled, requires custom CSS | No |
| Chakra UI Menu | +50KB | Full framework dependency | No |
| Custom Drawer | 0KB | Over-engineered for temporary surface | No |

**Implementation pattern:**
```typescript
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
const open = Boolean(anchorEl)

const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(e.currentTarget)
}

const handleMenuClose = () => {
  setAnchorEl(null)
}

const handleNavigate = (viewId: ViewType) => {
  setActiveView(viewId)
  handleMenuClose()
}

return (
  <>
    <IconButton onClick={handleMenuOpen}>
      <MenuIcon />
    </IconButton>
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {navItems.map(item => (
        <MenuItem
          key={item.id}
          selected={activeView === item.id}
          onClick={() => handleNavigate(item.id)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  </>
)
```

**State management:** Use existing MobX store methods:
- `setActiveView()` — already exists, handles view switching
- `activeView` — already observable, drives selected state in menu

**Integration points:**
- Hamburger button lives in AppBar `<Toolbar>` right side
- Replace `<NavigationDrawer />` component usage in App.tsx
- Remove `isNavigationCollapsed` state (no longer needed)

---

### 2. Modal Test Details

**Current state:** Right-side drawer (`Sidebar` component) that slides open when test selected

**New approach:** Replace drawer with modal Dialog dialog, opens on test selection

**Solution Components:**
```typescript
// MUI Dialog components (ALREADY IN @mui/material@5.12.0)
import {
  Dialog,              // Modal container with backdrop
  DialogTitle,         // Title with built-in close button
  DialogContent,       // Scrollable content area
  DialogActions,       // Footer buttons (optional)
  IconButton,          // Close button
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
```

**Why MUI Dialog over alternatives:**
| Option | Features | Chosen |
|--------|----------|--------|
| MUI Dialog | Scroll modes, focus trap, a11y, animations | ✓ YES |
| Radix AlertDialog | Basic modal, no scroll mgmt | No |
| Headless UI | Custom implementation required | No |
| Chakra Modal | Dependency overhead | No |

**Scroll handling in MUI Dialog:**
```typescript
// Default: scroll="paper" (scrolls within DialogContent)
<Dialog
  open={isDockOpen}
  onClose={closeDock}
  scroll="paper"  // Content scrolls in DialogContent area
  fullWidth
  maxWidth="sm"
>
  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    Test Details
    <IconButton onClick={closeDock} size="small">
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>
    {/* TestDetails component scrolls here if content overflows */}
    <TestDetails />
  </DialogContent>
</Dialog>

// Alternative: scroll="body" (entire dialog scrolls)
// Use when dialog title should be sticky
<Dialog scroll="body">...</Dialog>
```

**State management:** Use existing MobX store:
- `isDockOpen` boolean → Dialog `open` prop
- `selectedTestId` string → TestDetails component key
- `closeDock()` method → Dialog `onClose` handler
- `selectedTest` getter → Data source for TestDetails

**No new state management needed.** RootStore already tracks:
```typescript
isDockOpen = false  // Line 20 in store/index.tsx
selectedTestId: string | null = null  // Line 21

openDock = () => this.isDockOpen = true
closeDock = () => this.isDockOpen = false
selectTest = (testId: string) => {
  this.selectedTestId = testId
  this.openDock()
}
```

**Integration points:**
- Dialog renders at bottom of MainLayout (after main content Box)
- TestDetails component moves into DialogContent
- Remove Sidebar component usage
- Keep AttachmentViewer global (unchanged)

---

### 3. Persistent Status Bar in Top Bar

**Current state:** AppBar with Title (left), RunDateDisplay (center), Actions (right)

**New approach:** Add status indicators to AppBar center or right section

**Solution Components:**
```typescript
// MUI components (ALREADY IN @mui/material@5.12.0)
import {
  AppBar,          // Fixed top bar (unchanged)
  Toolbar,         // Flex container for layout
  Chip,            // Compact status badge
  Box,             // Layout container
  LinearProgress,  // Progress indicator (optional)
  Tooltip,         // Hover label
  Typography,      // Text labels
} from '@mui/material'
```

**Implementation pattern:**
```typescript
// In App.tsx AppBar/Toolbar section
<AppBar position="fixed">
  <Toolbar variant="dense">
    {/* Left: Title */}
    <Typography variant="h6">
      Qase | Report
    </Typography>

    {/* Center: Run Date + Status Indicators (NEW) */}
    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
      <RunDateDisplay />

      {/* Status indicators (if report loaded) */}
      {reportStore.runData && (
        <>
          <Tooltip title={`${passCount} passed, ${failCount} failed`}>
            <Chip
              label={`${passRate}%`}
              size="small"
              color={passRate > 80 ? 'success' : passRate > 50 ? 'warning' : 'error'}
              variant="outlined"
            />
          </Tooltip>
          <Chip
            label={`${totalTests} tests`}
            size="small"
            variant="outlined"
          />
        </>
      )}
    </Box>

    {/* Right: Actions + Hamburger Menu */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton onClick={() => setSearchOpen(true)}>
        <SearchIcon />
      </IconButton>
      <ExportButton />
      <ThemeToggle />
      <IconButton onClick={handleMenuOpen}>  {/* NEW: Hamburger */}
        <MenuIcon />
      </IconButton>
    </Box>
  </Toolbar>

  {/* Optional: Loading indicator when processing */}
  {reportStore.isLoading && (
    <LinearProgress sx={{ height: 2 }} />
  )}
</AppBar>
```

**Data sourcing:**
```typescript
// From existing reportStore (observable properties)
const { passRate, testCount, passCount, failCount } = reportStore
const totalTests = testCount
```

**No new components needed** — all MUI built-ins. No data pipeline changes.

---

## State Management (MobX — No Changes)

Existing RootStore handles all needed state:

```typescript
// Current RootStore (from src/store/index.tsx)
class RootStore {
  // Modal state (already exists)
  isDockOpen = false
  selectedTestId: string | null = null

  // View navigation (already exists)
  activeView: ViewType = 'dashboard'
  isNavigationCollapsed = false

  // Methods (already exist)
  openDock()
  closeDock()
  selectTest(testId: string)
  clearSelection()
  setActiveView(view: ViewType)
  toggleNavigation()
}
```

**What changes:**
- Remove `toggleNavigation()` method (no longer needed, drawer removed)
- Remove `isNavigationCollapsed` state (no longer needed)
- Keep all modal-related state (`isDockOpen`, `selectedTestId`)

**What stays:**
- All data stores (reportStore, testResultsStore, attachmentsStore)
- All computed properties (passRate, passCount, etc.)
- Observer pattern in components

---

## Layout Structure (Before → After)

### Current Layout
```
App.tsx
├── AppBar (fixed)
│   └── Toolbar (title, date, actions)
├── NavigationDrawer (permanent, collapsible)
├── MainLayout
│   ├── Main content (Dashboard/Tests/etc)
│   └── Sidebar (right, opens on test click)
└── SearchModal
```

### New Layout
```
App.tsx
├── AppBar (fixed, enhanced)
│   ├── Toolbar
│   │   ├── Title
│   │   ├── Status indicators (NEW: chips, progress)
│   │   └── Actions (search, export, theme, hamburger menu)
│   │       └── Menu Dropdown (NEW: navigation)
├── MainLayout
│   └── Main content (Dashboard/Tests/etc)
├── Dialog (NEW: modal test details, replaces Sidebar)
├── SearchModal
└── AttachmentViewer (global)
```

**Components removed:** NavigationDrawer, Sidebar
**Components added:** Menu dropdown, Dialog modal
**Components enhanced:** AppBar (status indicators)

---

## Installation

**NO new packages to install:**

```bash
# Verify all dependencies are present (they should be)
npm ls @mui/material @mui/icons-material mobx mobx-react-lite

# All components needed are already in package.json:
# @mui/material@5.12.0 ✓
# @mui/icons-material@5.18.0 ✓
# mobx@6.9.0 ✓
# mobx-react-lite@3.4.3 ✓
```

**Why no additions needed:**
| Feature | Components | Status |
|---------|-----------|--------|
| Hamburger menu | Menu, IconButton, MenuItem | Already in @mui/material |
| Modal dialog | Dialog, DialogTitle, DialogContent | Already in @mui/material |
| Status indicators | Chip, Box, Tooltip, LinearProgress | Already in @mui/material |
| Icons | Menu, Close, Search, etc. | Already in @mui/icons-material |
| State management | makeAutoObservable, observer | Already in mobx + mobx-react-lite |

---

## Alternatives Considered

### Dropdown Navigation
| Option | Bundle | Complexity | Chosen |
|--------|--------|-----------|--------|
| MUI Menu | 0KB (built-in) | Simple (state + click handler) | ✓ YES |
| Drawer with modal variant | 0KB (refactor) | Medium (drawer animations) | No |
| Custom popover | 0KB (custom) | High (focus mgmt, positioning) | No |
| Headless UI Popover | +8KB | Medium (unstyled) | No |

**Chosen: MUI Menu**
Rationale: Built-in, styled, accessible, no animation overhead vs Drawer, simpler state management

### Modal for Test Details
| Option | Bundle | Scrolling | Chosen |
|--------|--------|-----------|--------|
| MUI Dialog | 0KB (built-in) | Built-in scroll modes | ✓ YES |
| Chakra Modal | +50KB | Basic scrolling | No |
| Radix AlertDialog | +8KB | No built-in scroll | No |
| Custom modal | 0KB (complex) | Manual implementation | No |
| Keep right Sidebar | 0KB (existing) | Yes, but less discoverable | No |

**Chosen: MUI Dialog**
Rationale: Scroll="paper" handles overflow automatically, full focus trap, animations, a11y baked in

### Status Indicators in AppBar
| Option | Bundle | Flexibility | Chosen |
|--------|--------|-------------|--------|
| MUI Chip + Box | 0KB (built-in) | Full customization | ✓ YES |
| Custom div badges | 0KB (basic) | Limited styling | No |
| Specialized status bar lib | +15KB | Over-engineered | No |
| LinearProgress only | 0KB (minimal) | Limited info display | No |

**Chosen: MUI Chip + Box composition**
Rationale: Flexible, theme-aware, Tooltip integration, no dependency overhead

---

## Migration Path (Phase Breakdown)

### Phase 1: Hamburger Menu Integration (Low risk)
1. Add Menu + state to AppBar component
2. Extract nav items from NavigationDrawer
3. Test menu opens/closes correctly
4. Verify view navigation works
5. Delete NavigationDrawer from App.tsx
6. Update store: remove `isNavigationCollapsed`, `toggleNavigation()`

**Time estimate:** 2-3 hours
**Risk:** Low — isolated AppBar change

### Phase 2: Convert Sidebar to Modal (Medium risk)
1. Create Dialog wrapper around TestDetails
2. Bind `isDockOpen` → Dialog `open` prop
3. Bind `closeDock()` → Dialog `onClose`
4. Move Sidebar component content into DialogContent
5. Test scroll behavior with long details
6. Delete Sidebar component from codebase

**Time estimate:** 3-4 hours
**Risk:** Medium — requires state wiring, scroll testing

### Phase 3: Add Status Indicators (Low risk)
1. Create StatusBar sub-component with Chips
2. Wire reportStore stats (passRate, testCount, etc.)
3. Add conditional rendering if report loaded
4. Add LinearProgress for loading state (optional)
5. Test responsive layout (especially mobile)

**Time estimate:** 1-2 hours
**Risk:** Low — isolated AppBar enhancement

---

## Performance Impact

**Bundle:** +0KB (no new dependencies)

**Runtime:**
- Menu: No performance impact (standard MUI component)
- Dialog: No impact when closed (unmounts from DOM)
- Status indicators: Chip rendering ~0.1ms per render
- MobX observation: Already handling all state changes

**No virtual scrolling changes** — test list keeps react-window (from previous milestone)

**Memory:** Slight reduction removing permanent NavigationDrawer (drawer DOM no longer kept in tree)

---

## Accessibility (a11y)

**Menu:** MUI Menu includes:
- Role="menu" for screen readers
- Keyboard navigation (arrow keys, enter)
- Focus trap
- Focus restoration on close

**Dialog:** MUI Dialog includes:
- Role="dialog" / "alertdialog"
- Focus trap (stays in modal)
- Backdrop focus blur
- Close button keyboard accessible
- Scroll container properly marked

**Status indicators:** Chip + Tooltip:
- Tooltip provides context on hover/focus
- Chip size appropriate for touch targets (32px min)

**All patterns follow Material Design a11y guidelines.** No custom a11y work needed.

---

## Browser Support

All MUI 5 components support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

No new compatibility issues vs existing stack.

---

## Testing Considerations

### Menu Dropdown
- [ ] Click hamburger → menu opens
- [ ] Click menu item → navigates + menu closes
- [ ] Keyboard: Escape closes menu
- [ ] Keyboard: Arrow keys navigate items
- [ ] Click outside → menu closes

### Dialog Modal
- [ ] Click test item → dialog opens
- [ ] Dialog content scrolls when overflowing
- [ ] Click X button → dialog closes
- [ ] Click outside modal → closes (optional, can disable)
- [ ] Keyboard: Escape closes modal
- [ ] Tab focus stays within modal

### Status Indicators
- [ ] Indicators show when report loaded
- [ ] Values update when data changes
- [ ] Tooltip shows on hover/focus
- [ ] Responsive on mobile (<600px)

---

## Confidence Assessment

| Component | Confidence | Reasoning |
|-----------|------------|-----------|
| MUI Menu implementation | HIGH | Documented pattern, widely used in MUI apps |
| MUI Dialog scrolling | HIGH | Official docs cover scroll="paper" behavior |
| AppBar composition | HIGH | Already using AppBar, just adding elements |
| MobX state wiring | HIGH | Existing patterns in codebase (observer, store) |
| No new dependencies | HIGH | Verified all components in current package.json |

**Overall confidence: HIGH**
All features use well-established MUI patterns with no external dependencies. Integration with existing MobX store is straightforward refactoring of existing state.

---

## Sources

### MUI Component Documentation
- [MUI Menu Component](https://mui.com/material-ui/react-menu/) — Dropdown navigation implementation
- [MUI Dialog Component](https://mui.com/material-ui/react-dialog/) — Modal with scroll modes
- [MUI AppBar & Toolbar](https://mui.com/material-ui/react-app-bar/) — Layout and composition
- [MUI Chip Component](https://mui.com/material-ui/react-chips/) — Status indicators
- [MUI Icons](https://mui.com/material-ui/material-icons/) — Menu and close icons

### Patterns & Examples
- [Creating Hamburger Menu with MUI 5](https://david-mohr.com/blog/react-hamburger-menu-navigation)
- [Scrollable Dialog Content in MUI](https://github.com/mui/material-ui/issues/9602)
- [MUI Toolbar Alignment Patterns](https://mui.com/material-ui/react-app-bar/#simple-app-bar)

### Accessibility
- [MUI Menu a11y](https://mui.com/material-ui/react-menu/#api)
- [MUI Dialog a11y](https://mui.com/material-ui/react-dialog/#accessibility)
- [Material Design a11y Guidelines](https://m3.material.io/foundations/accessible-design)
