# Phase 13 Plan 01: Theme Foundation Summary

**MUI colorSchemes-based theme system with light/dark/system modes, localStorage persistence, and FOWT prevention**

## Metadata

phase: 13-theme-foundation
plan: 01
subsystem: theme
tags: [theme, ui, accessibility, dark-mode]
completed: 2026-02-10T16:59:29Z
duration: ~45 minutes

## Dependency Graph

**Requires:**
- @mui/material ^5.12.0 (experimental_extendTheme, CssVarsProvider)
- @mui/icons-material (Brightness4, Brightness7, BrightnessAuto)
- React 18 (context system)

**Provides:**
- `src/theme/index.ts` → exports theme configuration with colorSchemes
- `src/theme/ThemeRegistry.tsx` → exports ThemeRegistry wrapper component
- `src/components/ThemeToggle/index.tsx` → exports ThemeToggle UI control
- FOWT prevention inline script in index.html

**Affects:**
- src/App.tsx → wrapped with ThemeRegistry, ThemeToggle added to AppBar
- All MUI components → now support automatic light/dark switching

## Tech Stack

**Added:**
- MUI experimental_extendTheme API → colorSchemes configuration
- MUI Experimental_CssVarsProvider → theme context with CSS variables
- useColorScheme hook → theme state management

**Patterns:**
- CSS Variables with data attribute selector (data-mui-color-scheme)
- Three-way toggle pattern (light/dark/system) via Menu component
- SSR safety guard (`if (!mode) return null`)
- Inline script for FOWT prevention (reads localStorage before React mount)

## Key Files

**Created:**
- `src/theme/index.ts` (8 lines) → Theme configuration with colorSchemes
- `src/theme/ThemeRegistry.tsx` (13 lines) → CssVarsProvider wrapper with CssBaseline
- `src/components/ThemeToggle/index.tsx` (77 lines) → Three-way theme toggle with Menu

**Modified:**
- `src/App.tsx` → Replaced inline theme with ThemeRegistry, added ThemeToggle to AppBar
- `index.html` → Added inline FOWT prevention script in <head>

## Implementation Details

### Theme Configuration

Used MUI v5's experimental API for colorSchemes support:

```typescript
// src/theme/index.ts
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

export const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {},
  },
})
```

**Key decision:** Used `experimental_extendTheme` instead of `createTheme` because MUI v5.12 requires the experimental API for colorSchemes. The stable version is available in MUI v6, but project uses v5.

### Theme Provider Wrapper

Created ThemeRegistry component to encapsulate theme setup:

```typescript
// src/theme/ThemeRegistry.tsx
export const ThemeRegistry = ({ children }: PropsWithChildren) => {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      {children}
    </CssVarsProvider>
  )
}
```

**Pattern:** Wrapper component pattern separates theme concerns from App.tsx, makes theme swappable, includes CssBaseline for global style resets.

### Three-Way Theme Toggle

Implemented Menu-based toggle supporting light/dark/system modes:

```typescript
// src/components/ThemeToggle/index.tsx (excerpt)
export const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // SSR safety guard
  if (!mode) return null

  return (
    <>
      <IconButton onClick={handleMenuOpen} aria-label="theme settings">
        {getCurrentIcon()} {/* Shows Brightness4/7/Auto based on mode */}
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)}>
        <MenuItem onClick={() => handleModeChange('light')}>
          <ListItemIcon><Brightness7Icon /></ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        {/* Dark and System options */}
      </Menu>
    </>
  )
}
```

**UX choices:**
- Icon changes to reflect current mode (moon for dark, sun for light, auto for system)
- Menu pattern over toggle for three options (clearer than cycling)
- ListItemIcon for visual consistency
- aria-label for accessibility

### FOWT Prevention

Added inline script to index.html that runs before React mounts:

```html
<script>
  (function() {
    var key = 'mui-mode'
    var savedMode = localStorage.getItem(key)
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    var mode = savedMode || 'system'
    if (mode === 'system') {
      mode = systemDark ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-mui-color-scheme', mode)
  })()
</script>
```

**Why this works:**
1. Runs synchronously before any CSS loads
2. Reads from same localStorage key as MUI ('mui-mode')
3. Resolves 'system' to 'light' or 'dark' based on OS preference
4. Sets data attribute that MUI CSS variables rely on
5. No flash because attribute is set before first paint

### App Integration

Updated App.tsx to use new theme system:

```typescript
// Removed inline createTheme()
// Wrapped app with ThemeRegistry
// Added ThemeToggle to AppBar with flex layout:
<Toolbar variant="dense">
  <Box sx={{ flexGrow: 1 }}>Qase | Report</Box>
  <ThemeToggle />
</Toolbar>
```

**Layout:** Title on left (flexGrow: 1), theme toggle on right (natural flex end)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Used experimental APIs instead of stable APIs**
- **Found during:** Task 1 (theme configuration)
- **Issue:** Plan specified `createTheme` with `cssVariables` config, but MUI v5.12 doesn't support colorSchemes in stable createTheme API
- **Fix:** Used `experimental_extendTheme` and `Experimental_CssVarsProvider` from MUI v5 experimental APIs
- **Rationale:** MUI v5.12 requires experimental APIs for colorSchemes support. The stable version is only available in MUI v6 (Aug 2024). Research confirmed this is the correct approach for v5.
- **Files modified:** src/theme/index.ts, src/theme/ThemeRegistry.tsx
- **Commit:** a3f0444
- **Impact:** No functional difference, but API is marked experimental in v5. Migration path clear for v6 upgrade.

## Verification Results

**User-verified functionality (Task 4 checkpoint approved):**

1. **Theme switching** ✓
   - Theme toggle visible in AppBar
   - Menu shows light/dark/system options
   - UI colors change correctly for each mode

2. **Persistence** ✓
   - Selected theme survives page refresh
   - No flash of wrong theme on reload

3. **FOWT prevention** ✓
   - Tested with network throttling
   - No white flash before dark theme appears

4. **System mode live update** ✓
   - App follows OS dark mode setting in system mode
   - Updates without refresh when OS preference changes

5. **Technical validation** ✓
   - TypeScript compilation: SUCCESS
   - Build: SUCCESS
   - localStorage key 'mui-mode': VERIFIED
   - data-mui-color-scheme attribute: VERIFIED

## Success Criteria Met

- [x] Theme toggle visible in AppBar with three options (Light, Dark, System)
- [x] Selecting Dark mode changes all MUI component colors to dark palette
- [x] Selecting Light mode changes all MUI component colors to light palette
- [x] Selecting System mode follows OS preference
- [x] Theme persists across page refresh (no flash)
- [x] Theme persists after closing and reopening browser
- [x] System mode updates when OS preference changes
- [x] Build completes successfully with no TypeScript errors

## Decisions Made

**1. Three-way toggle over two-way toggle**
- **Context:** Research noted uncertainty about whether to support system mode or just light/dark
- **Decision:** Implemented full three-way toggle (light/dark/system)
- **Rationale:** Modern UX standard, respects user OS preference, MUI supports it by default
- **Trade-off:** Slightly more complex UI (Menu instead of IconButton), but clearer UX

**2. Menu pattern over toggle button**
- **Context:** Could use ToggleButtonGroup or cycling IconButton
- **Decision:** Used Menu with three MenuItems
- **Rationale:** Three options make cycling confusing (user has to remember order), Menu makes all options visible
- **Implementation:** IconButton shows current mode icon, Menu shows all three options with icons

**3. Inline script for FOWT prevention**
- **Context:** Research noted FOWT is rare in Vite SPAs, inline script adds complexity
- **Decision:** Implemented inline script in index.html
- **Rationale:** Better first impression, especially for users on dark mode. Script is small (13 lines), no maintenance burden
- **Trade-off:** Slight complexity, but eliminates all flash on page load

**4. experimental_extendTheme over createTheme**
- **Context:** Plan specified createTheme with cssVariables config (MUI v6 pattern)
- **Decision:** Used experimental_extendTheme (MUI v5 pattern)
- **Rationale:** Project uses MUI v5.12, colorSchemes not available in stable createTheme API until v6
- **Migration path:** When upgrading to v6, replace experimental_extendTheme → createTheme, Experimental_CssVarsProvider → ThemeProvider

## Performance Metrics

- **Tasks completed:** 4/4 (3 auto, 1 checkpoint)
- **Commits:** 3 implementation commits
- **Files created:** 3 (theme/index.ts, theme/ThemeRegistry.tsx, components/ThemeToggle/index.tsx)
- **Files modified:** 2 (App.tsx, index.html)
- **Lines added:** ~119 lines
- **Duration:** ~45 minutes (Task 1: 16:58:16 → Task 3: 16:59:29 + checkpoint verification)

## Known Limitations

1. **Experimental APIs:** Uses experimental_extendTheme and Experimental_CssVarsProvider from MUI v5. These are stable in v6 but marked experimental in v5. Migration required when upgrading to v6.

2. **No custom palette tokens:** Currently uses MUI's default light/dark palettes. Custom brand colors would require adding tokens to colorSchemes.light and colorSchemes.dark.

3. **Inline script duplication:** FOWT prevention script logic duplicates localStorage key and resolution logic from MUI. Must stay in sync if theme config changes.

4. **No cross-tab sync visual feedback:** MUI handles cross-tab sync via storage events, but no UI indication when another tab changes theme. This is standard behavior but could be confusing.

## Next Steps

**Immediate (Phase 13 continuation):**
- None - theme foundation complete, ready for design refresh implementation

**Future enhancements (deferred to v1.3+):**
- Add custom brand colors to theme palette
- Migrate to MUI v6 stable APIs (createTheme, ThemeProvider)
- Consider removing inline script if FOWT proves non-issue
- Add theme preview in Settings panel (if Settings panel is added)

## Self-Check: PASSED

**Files exist:**
```
FOUND: src/theme/index.ts
FOUND: src/theme/ThemeRegistry.tsx
FOUND: src/components/ThemeToggle/index.tsx
FOUND: src/App.tsx (modified)
FOUND: index.html (modified)
```

**Commits exist:**
```
FOUND: a3f0444 (Task 1: theme configuration)
FOUND: b15a23a (Task 2: ThemeToggle component)
FOUND: 777d3e2 (Task 3: integration and FOWT prevention)
```

**Verification:**
- TypeScript compilation: ✓ (no errors)
- Build: ✓ (npm run build succeeds)
- localStorage key: ✓ ('mui-mode' exists)
- data attribute: ✓ (data-mui-color-scheme on <html>)
- User verification: ✓ (Task 4 checkpoint approved)

All checks passed. Plan execution complete.
