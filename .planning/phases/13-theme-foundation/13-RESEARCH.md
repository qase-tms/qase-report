# Phase 13: Theme Foundation - Research

**Researched:** 2026-02-10
**Domain:** MUI 5 Theme System (CSS Variables & Color Schemes)
**Confidence:** HIGH

## Summary

MUI 5 provides a modern CSS Variables-based theming system with built-in support for light/dark/system color schemes. As of MUI v6 (August 2024), the `ThemeProvider` component absorbed all functionality from the experimental `CssVarsProvider`, making theme switching simpler and more performant. The system includes automatic localStorage persistence, system preference detection via `prefers-color-scheme`, cross-tab synchronization, and FOUC (Flash of Unstyled Content) prevention for SSR applications.

For Vite-based SPAs like Qase Report, implementation requires migrating from the basic `createTheme()` setup to the CSS Variables approach with `colorSchemes` configuration. The project currently uses a minimal theme setup (`createTheme()` without options), making migration straightforward with no existing custom palettes to preserve.

**Primary recommendation:** Use MUI's built-in `colorSchemes` API with `useColorScheme` hook and `data` attribute selector. For Vite SPAs, FOUC prevention can be achieved via inline script in `index.html` that reads localStorage before React mounts, or by simply accepting the brief flash (common for client-only apps).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 (current) | Theme system with color schemes | Official MUI solution, built-in persistence, zero-runtime CSS in v6 |
| @mui/icons-material | ^5.18.0 (current) | Icons for theme toggle (Brightness4/7) | First-party icon set, optimized for MUI |
| React 18 | ^18.2.0 (current) | Runtime for theme context | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage API | Browser native | Theme preference persistence | Built-in to MUI colorSchemes |
| matchMedia API | Browser native | System preference detection | Built-in to MUI colorSchemes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI colorSchemes | Manual Context + localStorage | More code, no cross-tab sync, manual FOUC handling |
| MUI colorSchemes | Third-party (next-themes, etc.) | Adds dependency, MUI has first-party solution |
| data attribute selector | class selector | Classes slightly more familiar, data attributes cleaner DOM |

**Installation:**
```bash
# No new dependencies required - already have @mui/material ^5.12.0
# Verify @mui/icons-material for Brightness4/Brightness7 icons (already installed)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── theme/
│   ├── index.ts          # createTheme with colorSchemes config
│   └── ThemeRegistry.tsx # ThemeProvider wrapper component
├── components/
│   └── ThemeToggle.tsx   # IconButton toggle (AppBar component)
└── App.tsx               # Wrap with ThemeRegistry
```

### Pattern 1: CSS Variables Theme Configuration
**What:** Configure theme with `colorSchemes` node and `cssVariables` selector
**When to use:** Always for v5.12+ with color scheme support
**Example:**
```typescript
// src/theme/index.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data', // Uses data-mui-color-scheme attribute
  },
  colorSchemes: {
    light: true,  // Enable with default palette
    dark: true,   // Enable with default palette
  },
  // Optional: custom default mode and storage key
  defaultMode: 'system', // 'light' | 'dark' | 'system'
  // Optional: custom localStorage key (default: 'mui-mode')
})
```

### Pattern 2: useColorScheme Hook for Mode Switching
**What:** Official hook to read/write theme mode with persistence
**When to use:** In components that need to toggle or display current theme
**Example:**
```typescript
// src/components/ThemeToggle.tsx
import { useColorScheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

export const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme()

  const handleToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  // mode is undefined on first render (SSR safety)
  if (!mode) return null

  return (
    <IconButton onClick={handleToggle} color="inherit">
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )
}
```

### Pattern 3: ThemeProvider Wrapper (Recommended)
**What:** Wrap ThemeProvider in a custom component for better organization
**When to use:** When separating theme concerns from App.tsx
**Example:**
```typescript
// src/theme/ThemeRegistry.tsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './index'
import type { FC, PropsWithChildren } from 'react'

export const ThemeRegistry: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
```

### Pattern 4: Inline Script FOUC Prevention (Optional for Vite SPA)
**What:** Add script to index.html to apply theme before React mounts
**When to use:** Only if FOUC is unacceptable for client-only SPA (rare)
**Example:**
```html
<!-- index.html -->
<head>
  <script>
    (function() {
      const key = 'mui-mode' // Must match theme config
      const savedMode = localStorage.getItem(key)
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      let mode = savedMode || 'system'
      if (mode === 'system') {
        mode = systemDark ? 'dark' : 'light'
      }

      document.documentElement.setAttribute('data-mui-color-scheme', mode)
    })()
  </script>
</head>
```

### Pattern 5: System Mode with Three-Way Toggle
**What:** Support light/dark/system with Menu or ToggleButtonGroup
**When to use:** When users want to override system preference or follow it
**Example:**
```typescript
import { useColorScheme } from '@mui/material/styles'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export const ThemeMenu = () => {
  const { mode, setMode } = useColorScheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        {/* Icon based on mode */}
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)}>
        <MenuItem onClick={() => setMode('light')}>Light</MenuItem>
        <MenuItem onClick={() => setMode('dark')}>Dark</MenuItem>
        <MenuItem onClick={() => setMode('system')}>System</MenuItem>
      </Menu>
    </>
  )
}
```

### Anti-Patterns to Avoid
- **Manual localStorage management:** Don't implement custom localStorage hooks - MUI colorSchemes handles this automatically with cross-tab sync
- **Reading mode on server:** `mode` is always `undefined` on first render (SSR safety), check for this before rendering
- **Mixing palette and colorSchemes:** If you provide both `colorSchemes` and `palette` in createTheme, `palette` overrides `colorSchemes` - choose one approach
- **Forgetting CssBaseline:** Without `<CssBaseline />`, background color won't adapt to theme
- **Mismatched selectors:** InitColorSchemeScript `attribute` prop must match theme's `colorSchemeSelector`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Custom localStorage hook | MUI colorSchemes built-in | Includes cross-tab sync, system detection, proper hydration handling |
| FOUC prevention | Custom inline script injection | MUI's data attribute + CssBaseline (SPA) or InitColorSchemeScript (SSR) | Handles edge cases, synchronizes with theme config |
| System preference detection | Custom matchMedia listener | MUI colorSchemes 'system' mode | Automatically updates on OS change, proper cleanup |
| Cross-tab sync | Custom storage event listeners | MUI colorSchemes | Built-in, tested, handles race conditions |
| Theme context | React Context + useState | useColorScheme hook | First-party, integrates with MUI components |

**Key insight:** MUI's colorSchemes system is a complete solution for theme management. Custom implementations miss edge cases like hydration mismatches, cross-tab synchronization race conditions, system preference change listeners, and proper cleanup. The official solution is zero-config for basic use and highly configurable for advanced needs.

## Common Pitfalls

### Pitfall 1: palette Override Precedence
**What goes wrong:** Defining both `palette` and `colorSchemes` in createTheme causes palette to win, colorSchemes is ignored
**Why it happens:** MUI's backward compatibility - old palette API takes precedence
**How to avoid:** Use ONLY `colorSchemes` when enabling CSS variables, or migrate palette customizations into colorSchemes.light/dark
**Warning signs:** Theme doesn't switch despite calling setMode, console warnings about conflicting configs

### Pitfall 2: SSR Hydration Mismatch
**What goes wrong:** Server renders with undefined mode, client reads localStorage, React throws hydration error
**Why it happens:** localStorage not available on server, mode is undefined on first render
**How to avoid:** Check if mode exists before rendering theme-dependent content: `if (!mode) return null`
**Warning signs:** Console errors about hydration mismatch, text content differs from server-rendered HTML

### Pitfall 3: Forgetting CssBaseline
**What goes wrong:** Background color stays white in dark mode, text colors don't adapt
**Why it happens:** CssBaseline applies global styles that respect color scheme
**How to avoid:** Always render `<CssBaseline />` inside ThemeProvider
**Warning signs:** Dark mode toggle changes component colors but background stays light

### Pitfall 4: InitColorSchemeScript Attribute Mismatch
**What goes wrong:** FOUC still occurs despite using InitColorSchemeScript
**Why it happens:** Script sets data-mui-color-scheme attribute, but theme uses 'class' selector (or vice versa)
**How to avoid:** Ensure InitColorSchemeScript `attribute` prop matches theme's `colorSchemeSelector` value
**Warning signs:** Flash of wrong theme persists, data attributes don't match expected format

### Pitfall 5: Reading mode Too Early
**What goes wrong:** Theme toggle button doesn't appear or shows wrong icon on first render
**Why it happens:** mode is undefined during SSR and first client render
**How to avoid:** Add guard: `if (!mode) return null` or use loading state
**Warning signs:** Button missing on page load, hydration warnings, icon flickers

### Pitfall 6: Custom Token Inconsistency
**What goes wrong:** Custom palette tokens work in light mode but undefined in dark mode
**Why it happens:** Defining token in colorSchemes.light but not colorSchemes.dark
**How to avoid:** If a token exists in one scheme, define it in all schemes (even if same value)
**Warning signs:** Console warnings about undefined palette values, styling breaks when switching modes

### Pitfall 7: Vite SPA Inline Script Sync Issues
**What goes wrong:** Inline script sets theme, but React resets it on mount
**Why it happens:** Theme config defaultMode doesn't match inline script logic
**How to avoid:** Ensure inline script uses same localStorage key and default mode as theme config, OR skip inline script entirely for SPAs (FOUC is brief and acceptable)
**Warning signs:** Theme flashes correct then wrong, localStorage key mismatches

## Code Examples

Verified patterns from official sources:

### Complete Migration from Basic Theme
```typescript
// BEFORE: src/App.tsx (current state)
import { createTheme, ThemeProvider } from '@mui/material'

function App() {
  const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      {/* app content */}
    </ThemeProvider>
  )
}

// AFTER: src/theme/index.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  colorSchemes: {
    light: true,
    dark: true,
  },
})

// AFTER: src/App.tsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* app content */}
    </ThemeProvider>
  )
}
```

### AppBar with Theme Toggle
```typescript
// src/components/ThemeToggle.tsx
import { useColorScheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

export const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme()

  if (!mode) return null // SSR safety

  return (
    <IconButton
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      color="inherit"
      aria-label="toggle theme"
    >
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )
}

// src/App.tsx (AppBar integration)
import { AppBar, Toolbar, Box } from '@mui/material'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <Box sx={{ flexGrow: 1 }}>Qase | Report</Box>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      {/* rest of app */}
    </ThemeProvider>
  )
}
```

### Testing Theme Persistence
```typescript
// Verification script (browser console)
// 1. Check localStorage key exists
localStorage.getItem('mui-mode') // Should return 'light', 'dark', or 'system'

// 2. Check data attribute on HTML element
document.documentElement.getAttribute('data-mui-color-scheme') // Should return 'light' or 'dark'

// 3. Verify system preference detection
window.matchMedia('(prefers-color-scheme: dark)').matches // true if OS is dark mode

// 4. Test cross-tab sync
// Open app in two tabs, toggle theme in one, other tab should update automatically
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CssVarsProvider (experimental) | ThemeProvider with cssVariables | MUI v6 (Aug 2024) | Simplified API, one provider for all use cases |
| Manual theme.palette.mode toggle | useColorScheme hook | MUI v5.0.5+ (2021) | Automatic persistence, system detection, cross-tab sync |
| Emotion runtime styling | Pigment CSS (zero-runtime) | MUI v6 (Aug 2024) | Faster loads, no FOUC, smaller bundle |
| InitColorSchemeScript component | Same component (now stable) | MUI v6 (Aug 2024) | Moved from experimental to stable API |
| Manual localStorage hooks | Built-in storageManager | MUI v5.0.5+ (2021) | Cross-tab sync, custom storage backends |

**Deprecated/outdated:**
- **CssVarsProvider**: Merged into ThemeProvider in v6, still works but deprecated
- **palette.mode manual toggle**: Use `colorSchemes` instead for persistence and system detection
- **theme.palette.type (v4)**: Replaced by theme.palette.mode in v5
- **Custom theme context for dark mode**: Use useColorScheme instead

## Open Questions

1. **Should we support three-way toggle (light/dark/system) or just two-way (light/dark)?**
   - What we know: MUI defaults to 'system' when colorSchemes enabled, most modern apps support all three
   - What's unclear: User preference - is three-way toggle too complex for this use case?
   - Recommendation: Start with two-way toggle (light/dark) for v1.1, add system mode in v1.2 if requested. Simpler UX, meets core requirements.

2. **Is FOUC prevention mandatory for Vite SPA?**
   - What we know: Vite SPAs have brief flash (~50-100ms) during React mount, InitColorSchemeScript designed for SSR/SSG (Next.js)
   - What's unclear: Whether users will notice/complain about brief flash in client-only app
   - Recommendation: Ship without inline script first (simpler), add if users report FOUC as issue. Most Vite SPAs accept brief flash as acceptable tradeoff.

3. **Should theme state live in MobX store or use MUI's internal state?**
   - What we know: MUI colorSchemes has internal state + localStorage, MobX is already used for app state
   - What's unclear: Whether theme should be observable in MobX for other stores to react to
   - Recommendation: Use MUI's internal state via useColorScheme hook. Theme is UI-only concern, not business logic. Keeps theme self-contained and leverages built-in features (persistence, cross-tab sync).

## Sources

### Primary (HIGH confidence)
- [Dark mode - Material UI](https://mui.com/material-ui/customization/dark-mode/) - Official MUI v6 documentation on colorSchemes API
- [CSS theme variables - Configuration](https://mui.com/material-ui/customization/css-theme-variables/configuration/) - Official guide for cssVariables setup
- [InitColorSchemeScript component](https://mui.com/material-ui/react-init-color-scheme-script/) - Official docs on FOUC prevention
- [InitColorSchemeScript API](https://mui.com/material-ui/api/init-color-scheme-script/) - API reference
- [Upgrade to v6 - Material UI](https://mui.com/material-ui/experimental-api/css-theme-variables/migration/) - CssVarsProvider → ThemeProvider migration
- [IconButton API - Material UI](https://mui.com/material-ui/api/icon-button/) - Official IconButton documentation
- [Toggle Button React component](https://mui.com/material-ui/react-toggle-button/) - Official toggle button patterns

### Secondary (MEDIUM confidence)
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering) - Inline script pattern explained
- [Implementing Dark mode for React app with MUI](https://sachinkanishka.medium.com/adding-dark-mode-for-react-typescript-app-with-mui-226fa0154571) - Real-world example with Brightness icons
- [Use MUI CSS theme variables to prevent dark-mode SSR flickering](https://blog.arlenx.io/posts/use-mui-css-theme-variables-to-prevent-dark-mode-ssr-flickering-in-nextjs-app) - Next.js implementation (SSR context)
- [prefers-color-scheme - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) - System preference media query

### Tertiary (LOW confidence)
- GitHub issues #43622, #35888, #36245, #43996, #44250 - Community-reported edge cases and gotchas
- Medium articles and tutorial sites (various authors) - Implementation patterns (cross-verified with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official MUI v5/v6 documentation, stable API since v5.0.5, v6 makes it primary approach
- Architecture: HIGH - Official examples in docs, verified patterns from MUI GitHub, real-world usage confirmed
- Pitfalls: MEDIUM-HIGH - Mix of official docs (palette precedence) and GitHub issues (edge cases), some from community experience

**Research date:** 2026-02-10
**Valid until:** 2026-04-10 (60 days - MUI v6 is stable, v7 not expected until Q4 2026 per release cycle)
**MUI version researched:** v5.12.0 (current in project) → v6.x patterns (forward-compatible)
**Note:** Project uses MUI 5.12.0; all patterns are compatible, v6 features (ThemeProvider unification) are optional upgrades
