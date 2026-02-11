# Phase 18: Dark Theme Foundation - Research

**Researched:** 2026-02-10
**Domain:** MUI Dark Theme Customization & Default Mode Configuration
**Confidence:** HIGH

## Summary

Phase 18 builds on the existing Phase 13 theme system (colorSchemes with light/dark/system support) to make dark theme the default and customize the color palette to match Playwright Smart Reporter's aesthetic. The project currently uses MUI v5.12.0 with `experimental_extendTheme` and `Experimental_CssVarsProvider`, which are functional but slightly outdated patterns. MUI v6 (released August 2024) consolidated these APIs into standard `ThemeProvider`, but v5.12.0 patterns remain fully supported.

The core task involves two configuration changes: (1) setting `defaultMode: 'dark'` in the theme configuration, and (2) customizing the `colorSchemes.dark` palette with professional dark theme colors inspired by modern developer tools (VS Code, GitHub, JetBrains) and Material Design's dark theme guidelines.

While specific Playwright Smart Reporter color values are not publicly documented, research indicates professional dark themes use dark gray backgrounds (#121212 to #1e1e1e range), desaturated accent colors for reduced eye strain, and clear visual hierarchy through surface elevation. MUI's default dark palette provides excellent foundations that align with these principles.

**Primary recommendation:** Update theme configuration to set `defaultMode: 'dark'` and customize `colorSchemes.dark` palette with professional dark gray backgrounds (#121212 base, #1e1e1e elevated surfaces) and MUI's default accent colors (which already follow Material Design dark theme best practices). Update inline FOWT prevention script to match new default. Light theme remains accessible via existing ThemeToggle component.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 (current) | Dark theme palette customization | Already in project, colorSchemes API supports dark customization |
| experimental_extendTheme | MUI v5.12.0 API | Theme with colorSchemes | Current project API (v6 uses extendTheme without prefix) |
| Experimental_CssVarsProvider | MUI v5.12.0 API | Theme provider with CSS variables | Current project API (v6 merged into ThemeProvider) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage API | Browser native | Persists theme preference | Built-in to MUI colorSchemes |
| data-mui-color-scheme attribute | MUI convention | CSS variable selector | Already configured in Phase 13 |
| InitColorSchemeScript (inline) | Phase 13 implementation | FOWT prevention | Already in index.html, needs update to match new default |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Upgrade to MUI v6 | Keep v5.12.0 | v6 simplifies API (ThemeProvider replaces CssVarsProvider) but requires dependency upgrade and testing |
| Custom dark palette | MUI default dark palette | Custom gives exact Playwright match, default is proven and accessible |
| defaultMode in theme config | defaultMode prop on provider | v5.12.0 uses provider prop, v6 uses theme config - current project uses provider |

**Installation:**
```bash
# No new dependencies required - all features available in @mui/material ^5.12.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── theme/
│   ├── index.ts              # Theme config with defaultMode and dark palette (MODIFY)
│   └── ThemeRegistry.tsx     # Provider with defaultMode prop (MODIFY)
├── components/
│   └── ThemeToggle/          # Three-way toggle (existing, NO CHANGES)
│       └── index.tsx
└── App.tsx                   # Uses ThemeRegistry (existing, NO CHANGES)
index.html                    # FOWT script (MODIFY to match new default)
```

### Pattern 1: Setting Dark Mode as Default in MUI v5.12.0
**What:** Configure default mode via CssVarsProvider prop (not theme config in v5.12.0)
**When to use:** When making dark theme the default on app load
**Example:**
```typescript
// src/theme/ThemeRegistry.tsx (CURRENT v5.12.0 pattern)
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'

export const ThemeRegistry = ({ children }: PropsWithChildren) => {
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  )
}
```

**Note:** In MUI v6+, `defaultMode` moves to theme config object, but v5.12.0 uses provider prop pattern.

### Pattern 2: Customizing Dark Theme Palette
**What:** Override default dark colors in `colorSchemes.dark` node
**When to use:** When matching specific design aesthetic (Playwright-style)
**Example:**
```typescript
// src/theme/index.ts
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

export const theme = extendTheme({
  colorSchemes: {
    light: {},  // Keep default light palette
    dark: {
      palette: {
        background: {
          default: '#121212',  // MUI standard dark background
          paper: '#1e1e1e',    // Elevated surfaces (slightly lighter)
        },
        primary: {
          main: '#90caf9',     // MUI default dark primary (light blue)
        },
        secondary: {
          main: '#ce93d8',     // MUI default dark secondary (light purple)
        },
        text: {
          primary: '#fff',     // White text
          secondary: 'rgba(255, 255, 255, 0.7)',  // Dimmed text
        },
      },
    },
  },
})
```

### Pattern 3: Professional Dark Theme Colors
**What:** Color values recommended by Material Design and industry standards
**When to use:** When designing dark themes for developer tools and test reporters
**Example:**
```typescript
// Professional dark theme palette structure
const professionalDarkPalette = {
  // Backgrounds: Dark grays (never pure black)
  background: {
    default: '#121212',   // Base surface (Material Design standard)
    paper: '#1e1e1e',     // Elevated surface (cards, dialogs)
  },
  // Accent colors: Desaturated, high contrast against dark
  primary: {
    main: '#90caf9',      // Light blue (MUI default, good contrast)
    light: '#e3f2fd',     // Very light blue
    dark: '#42a5f5',      // Medium blue
  },
  secondary: {
    main: '#ce93d8',      // Light purple (MUI default)
    light: '#f3e5f5',     // Very light purple
    dark: '#ab47bc',      // Medium purple
  },
  // Text: White with opacity for hierarchy
  text: {
    primary: '#fff',                        // Main text (100% white)
    secondary: 'rgba(255, 255, 255, 0.7)', // Supporting text (70% opacity)
    disabled: 'rgba(255, 255, 255, 0.5)',  // Disabled text (50% opacity)
  },
  // Status colors: Slightly desaturated for dark mode
  error: {
    main: '#f44336',      // Red (slightly desaturated)
  },
  warning: {
    main: '#ff9800',      // Orange
  },
  success: {
    main: '#4caf50',      // Green
  },
}
```

### Pattern 4: Updating FOWT Prevention Script
**What:** Modify inline script to default to dark when no preference saved
**When to use:** When changing default mode to ensure no flash on first load
**Example:**
```html
<!-- index.html (BEFORE - Phase 13) -->
<script>
  (function() {
    var key = 'mui-mode'
    var savedMode = localStorage.getItem(key)
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    var mode = savedMode || 'system'  // OLD: defaults to system
    if (mode === 'system') {
      mode = systemDark ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-mui-color-scheme', mode)
  })()
</script>

<!-- index.html (AFTER - Phase 18) -->
<script>
  (function() {
    var key = 'mui-mode'
    var savedMode = localStorage.getItem(key)
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    var mode = savedMode || 'dark'  // NEW: defaults to dark
    if (mode === 'system') {
      mode = systemDark ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-mui-color-scheme', mode)
  })()
</script>
```

**Critical:** Script default must match `defaultMode` prop in ThemeRegistry to prevent flash.

### Anti-Patterns to Avoid
- **Mismatched defaults:** FOWT script defaults to 'system' but ThemeRegistry uses `defaultMode="dark"` → causes flash
- **Pure black backgrounds (#000000):** Causes eye strain, poor contrast for shadows/elevation
- **Over-saturated accent colors:** Bright saturated colors cause eye strain in dark mode
- **Modifying colorSchemes.light:** Phase 18 only changes dark theme, light should remain default
- **Removing system mode:** Keep all three modes (light/dark/system) accessible via toggle

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark color palette | Custom color system from scratch | MUI default dark palette + selective customization | MUI defaults follow Material Design accessibility guidelines (15.8:1 contrast ratio) |
| Surface elevation colors | Manual color calculations | MUI's automatic surface elevation (already working) | MUI handles elevation overlays automatically in dark mode |
| FOWT prevention | New inline script | Update existing Phase 13 script (change default value) | Existing script works perfectly, just needs one value changed |
| Theme persistence | Additional localStorage logic | Existing MUI colorSchemes (already working) | Phase 13 already implemented persistence, no changes needed |

**Key insight:** Phase 13 built a complete theme system. Phase 18 is purely configuration changes (defaultMode + palette customization), not new infrastructure. Resist temptation to rebuild - just configure.

## Common Pitfalls

### Pitfall 1: FOWT Script and Provider Default Mismatch
**What goes wrong:** Page loads in light mode briefly, then switches to dark after React mounts
**Why it happens:** Inline script defaults to 'system' but provider has `defaultMode="dark"`
**How to avoid:** Ensure FOWT script default value matches `defaultMode` prop on CssVarsProvider
**Warning signs:** Brief flash of light theme on first load (when no localStorage value exists)

### Pitfall 2: Pure Black Backgrounds
**What goes wrong:** Eye strain, shadows invisible, poor visual hierarchy
**Why it happens:** Assuming darkest = best for dark mode
**How to avoid:** Use dark gray (#121212 or #1e1e1e), never pure black (#000000)
**Warning signs:** Users complain about eye strain, elevated surfaces don't stand out from background

### Pitfall 3: Over-Saturated Accent Colors
**What goes wrong:** Bright colors cause eye strain and harsh contrast in dark mode
**Why it happens:** Reusing light theme bright colors in dark mode
**How to avoid:** Use desaturated versions of accent colors (MUI defaults already handle this)
**Warning signs:** Primary buttons feel too bright, colors "glow" against dark background

### Pitfall 4: Breaking Existing Light Theme
**What goes wrong:** Light theme stops working or has wrong colors
**Why it happens:** Accidentally modifying `colorSchemes.light` or removing it
**How to avoid:** Only modify `colorSchemes.dark`, keep `colorSchemes.light` as empty object (uses defaults)
**Warning signs:** Light theme toggle shows wrong colors or throws errors

### Pitfall 5: Forgetting to Test All Components
**What goes wrong:** Some components have hard-coded light colors that don't adapt
**Why it happens:** Assuming all components automatically adapt to dark theme
**How to avoid:** Test all views (Dashboard, TestList, TestDetails, etc.) in dark mode
**Warning signs:** White text on white background, poor contrast in specific components

### Pitfall 6: Wrong Default Mode Syntax for MUI v5.12.0
**What goes wrong:** Dark mode doesn't become default despite configuration
**Why it happens:** Using v6 syntax (`defaultMode` in theme config) instead of v5 syntax (prop on provider)
**How to avoid:** In v5.12.0, `defaultMode` is a prop on `CssVarsProvider`, NOT in theme config object
**Warning signs:** TypeScript error or default mode ignored, still defaults to system

## Code Examples

Verified patterns from research and official sources:

### Complete Phase 18 Implementation

```typescript
// src/theme/index.ts (AFTER Phase 18)
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

export const theme = extendTheme({
  colorSchemes: {
    light: {},  // Keep default light palette
    dark: {
      palette: {
        background: {
          default: '#121212',  // Material Design standard
          paper: '#1e1e1e',    // Slightly lighter for elevation
        },
        primary: {
          main: '#90caf9',     // MUI default (good for dark mode)
        },
        secondary: {
          main: '#ce93d8',     // MUI default (good for dark mode)
        },
        // Text colors already good in MUI defaults
        // Status colors (error, warning, success) already good in MUI defaults
      },
    },
  },
})
```

```typescript
// src/theme/ThemeRegistry.tsx (AFTER Phase 18)
import { PropsWithChildren } from 'react'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './index'

export const ThemeRegistry = ({ children }: PropsWithChildren) => {
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  )
}
```

```html
<!-- index.html (AFTER Phase 18) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Qase Report</title>
    <script>
      (function() {
        var key = 'mui-mode'
        var savedMode = localStorage.getItem(key)
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        var mode = savedMode || 'dark'  // Changed from 'system' to 'dark'
        if (mode === 'system') {
          mode = systemDark ? 'dark' : 'light'
        }
        document.documentElement.setAttribute('data-mui-color-scheme', mode)
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Testing Dark Theme as Default

```typescript
// Manual verification checklist (browser DevTools console)

// 1. Clear localStorage and verify dark is default
localStorage.removeItem('mui-mode')
// Refresh page → should load in DARK mode (not light, not system)

// 2. Verify theme toggle still works
// Click theme icon → Select "Light" → page switches to light
// Refresh page → should stay in LIGHT mode (persisted)

// 3. Verify system mode still works
// Click theme icon → Select "System" → follows OS preference
// Change OS dark mode setting → app updates automatically

// 4. Check data attribute matches
document.documentElement.getAttribute('data-mui-color-scheme')
// Should return: 'dark' (on first load with no saved preference)

// 5. Verify no FOWT
// Open DevTools > Network tab > set throttling to "Slow 3G"
// Clear localStorage > Refresh
// Should load directly in dark mode with NO flash of light theme
```

### Alternative: Minimal Customization (MUI Defaults)

```typescript
// If Playwright-style customization not needed, keep MUI defaults
// src/theme/index.ts (minimal approach)
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

export const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {},  // Empty = use all MUI defaults (already excellent for dark mode)
  },
})

// Only change defaultMode in ThemeRegistry.tsx
// MUI's default dark palette already follows Material Design guidelines:
// - background.default: #121212
// - background.paper: #121212
// - primary.main: #90caf9 (light blue)
// - secondary.main: #ce93d8 (light purple)
// - Proper text contrast and accessibility
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| System mode as default | Dark mode as default | Industry trend 2024-2026 | 81.9% mobile, 82.7% desktop users prefer dark mode |
| Experimental_CssVarsProvider | ThemeProvider with cssVariables | MUI v6 (Aug 2024) | API consolidation (project still on v5.12.0) |
| Pure black (#000000) | Dark gray (#121212) | Material Design 2019+ | Reduces eye strain, better elevation visibility |
| Saturated accent colors | Desaturated accent colors | Material Design dark theme update | Reduces eye strain in prolonged use |
| Surface elevation via shadows | Tonal overlays + shadows | Material Design 3 (2022+) | Better elevation communication in dark mode |

**Deprecated/outdated:**
- **Pure black backgrounds:** Replaced by dark gray (#121212) for better UX
- **Light mode as universal default:** Modern apps default to dark, respect user preference
- **Bright saturated colors in dark mode:** Replaced by desaturated variants for accessibility

## Open Questions

1. **Should we use MUI default dark palette or customize to match Playwright exactly?**
   - What we know: MUI defaults (#121212, #90caf9, etc.) follow Material Design accessibility guidelines
   - What's unclear: Exact Playwright Smart Reporter hex values not publicly documented
   - Recommendation: Start with MUI defaults (proven accessible, 15.8:1 contrast ratio). If user requests closer Playwright match, customize `background.paper` to #1e1e1e for elevated surfaces. MUI defaults are professional and widely recognized.

2. **Should we upgrade to MUI v6 for cleaner API before implementing dark default?**
   - What we know: v6 consolidates APIs (no more Experimental_ prefix), simpler syntax
   - What's unclear: Upgrade effort, potential breaking changes in v5→v6
   - Recommendation: No. Phase 18 works perfectly with v5.12.0 current patterns. Defer v6 upgrade to separate technical debt phase. Current implementation is stable and well-tested.

3. **Do all existing components handle dark theme properly?**
   - What we know: Phase 13 implemented theme system, likely tested components in dark mode
   - What's unclear: Whether all components (especially custom ones) were tested thoroughly in dark mode
   - Recommendation: Include comprehensive visual testing in Phase 18 plan - load each view (Dashboard, TestList, TestDetails, attachments, etc.) in dark mode and verify no hard-coded light colors.

4. **Should we customize status colors (error, warning, success) for dark mode?**
   - What we know: MUI provides automatic dark mode variants of status colors
   - What's unclear: Whether Playwright uses different status color scheme
   - Recommendation: Keep MUI defaults for status colors. They're already optimized for accessibility (sufficient contrast on dark backgrounds). Only customize if user feedback indicates need.

## Sources

### Primary (HIGH confidence)
- [Dark mode - Material UI](https://mui.com/material-ui/customization/dark-mode/) - Official MUI dark mode documentation
- [Palette - Material UI](https://mui.com/material-ui/customization/palette/) - Official palette customization guide
- [CSS theme variables - Configuration - Material UI](https://mui.com/material-ui/customization/css-theme-variables/configuration/) - ColorSchemes configuration
- Phase 13 research (13-RESEARCH.md) - Current theme system implementation
- [Material Design's Color Palette - Google Design](https://design.google/library/material-design-dark-theme) - Dark theme principles and elevation
- [Design a dark theme with Material and Figma | Google Codelabs](https://codelabs.developers.google.com/codelabs/design-material-darktheme) - Material Design dark theme workshop

### Secondary (MEDIUM confidence)
- [Modern App Colors: Design Palettes That Work In 2026](https://webosmotic.com/blog/modern-app-colors/) - 81.9% mobile, 82.7% desktop prefer dark mode
- [6 Dark Mode Website Color Palette Ideas](https://www.vev.design/blog/dark-mode-website-color-palette/) - Professional dark palette patterns
- [50 Shades of Dark Mode Gray](https://blog.karenying.com/posts/50-shades-of-dark-mode-gray/) - Why not pure black
- [Light & Dark Color Modes in Design Systems | Medium](https://medium.com/eightshapes-llc/light-dark-9f8ea42c9081) - Surface color hierarchy
- [The ultimate guide to coding dark mode layouts in 2025 | Bootcamp](https://medium.com/design-bootcamp/the-ultimate-guide-to-implementing-dark-mode-in-2025-bbf2938d2526) - Best practices 2025-2026
- [Create a Light and Dark Mode Theme Toggle in React | Jeff Szuc](https://jeffszuc.com/posts/articles/theme-toggle) - React dark mode patterns

### Tertiary (LOW confidence - Playwright references)
- [GitHub - qa-gary-parker/playwright-smart-reporter](https://github.com/qa-gary-parker/playwright-smart-reporter) - Reference for aesthetic (specific colors not documented)
- [Playwright UI Mode | Medium](https://medium.com/@daveahern/playwright-ui-mode-b0e887e5ead1) - Playwright UI has dark theme but no color specs
- VS Code dark theme colors: #1e1e1e, #252526, #2d2d30 (cross-verified from multiple sources)
- JetBrains dark theme (community ports to VS Code show similar gray ranges)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - MUI v5.12.0 well-documented, colorSchemes API stable since v5.0.5
- Architecture: HIGH - defaultMode configuration well-documented in MUI docs, Phase 13 provides proven foundation
- Dark palette values: HIGH - Material Design guidelines official, MUI defaults verified
- Playwright aesthetic match: MEDIUM-LOW - No official Playwright color specs found, inferring from modern dev tool patterns

**Research date:** 2026-02-10
**Valid until:** 2026-04-10 (60 days - MUI v5.12.0 stable, dark mode patterns mature)
**MUI version researched:** v5.12.0 (current in project) → v6.x patterns noted but not required
**Note:** Phase 18 builds on Phase 13 foundation. All Phase 13 infrastructure (ThemeRegistry, ThemeToggle, FOWT prevention) remains unchanged except configuration values.
