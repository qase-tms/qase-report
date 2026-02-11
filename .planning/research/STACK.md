# Technology Stack: v1.2 Design Refresh

**Project:** Qase Report
**Researched:** 2026-02-10
**Scope:** Additions for design refresh milestone (theme system, micro-visualizations, animations, virtual scrolling)

## Executive Summary

The v1.2 design refresh requires minimal new dependencies. MUI 5 already provides most needed capabilities (theming, transitions, CircularProgress). The key decisions are:

1. **Theme system**: Use MUI's built-in `colorSchemes` API — no new dependencies
2. **Animations**: Use MUI built-in transitions (Fade, Collapse, Grow) — no new dependencies
3. **Virtual scrolling**: Add `react-window` for 100-500 test lists — ~6KB gzipped
4. **Sparklines**: Use existing Recharts with minimal config — no new dependencies
5. **Progress rings**: Use MUI CircularProgress — no new dependencies

**Total new bundle impact: ~6KB gzipped** (only react-window)

---

## Recommended Stack Additions

### Theme System

| Technology | Version | Purpose | Bundle Impact |
|------------|---------|---------|---------------|
| MUI colorSchemes API | (built-in MUI 5.12+) | Light/dark/system themes | 0KB (existing) |

**Why MUI colorSchemes over manual implementation:**
- Built-in localStorage persistence via `modeStorageKey`
- `useColorScheme` hook for reading/setting mode
- Automatic system preference detection
- CSS variables for instant theme switching without re-render
- No hydration flash with `InitColorSchemeScript`

**Implementation pattern:**
```typescript
import { createTheme, ThemeProvider } from '@mui/material'

const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
  defaultColorScheme: 'system', // Respects OS preference
})
```

**Confidence:** HIGH — Verified via official MUI documentation

---

### Animations & Transitions

| Technology | Version | Purpose | Bundle Impact |
|------------|---------|---------|---------------|
| MUI Transitions | (built-in MUI 5) | Fade, Collapse, Grow, Slide | 0KB (existing) |
| CSS transitions | (native) | Hover effects, micro-interactions | 0KB |

**Why NOT framer-motion:**
- framer-motion adds ~32KB gzipped (or ~17KB with LazyMotion)
- MUI's built-in Fade, Grow, Collapse, Slide cover 95% of v1.2 needs
- CSS transitions handle hover states, color changes, simple transforms
- Overkill for this scope — no complex orchestrated animations needed

**MUI Transitions available:**
- `Fade` — opacity transitions, enter/exit animations
- `Grow` — scale + fade from center
- `Collapse` — accordion, expandable sections
- `Slide` — directional enter/exit

**Customization via theme:**
```typescript
theme.transitions.create(['background-color', 'transform'], {
  duration: theme.transitions.duration.short, // 250ms
  easing: theme.transitions.easing.easeInOut,
})
```

**When to consider framer-motion (NOT v1.2):**
- Complex gesture-based animations
- Shared element transitions
- Physics-based springs
- Layout animations

**Confidence:** HIGH — MUI transitions are well-documented and already in bundle

---

### Virtual Scrolling

| Technology | Version | Purpose | Bundle Impact |
|------------|---------|---------|---------------|
| react-window | ^2.2.6 | Virtual list for 100-500 tests | ~6KB gzipped |

**Why react-window over react-virtuoso:**
- **Bundle size**: react-window ~6KB vs react-virtuoso ~24KB
- **Use case fit**: Fixed-height test items (TestListItem) = react-window sweet spot
- **Simplicity**: Simpler API for straightforward virtualized lists
- **Same author**: react-window is the "smaller, faster" rewrite of react-virtualized

**Why NOT react-virtuoso:**
- Dynamic heights not needed — test items have consistent height
- Advanced features (grouped headers, complex grids) not needed for test list
- 4x larger bundle for features we won't use

**When react-virtuoso would be better:**
- Variable-height items
- Sticky group headers
- Complex bidirectional scrolling

**Implementation:**
```typescript
import { FixedSizeList as List } from 'react-window'

<List
  height={600}
  itemCount={filteredTests.length}
  itemSize={72} // Fixed height per TestListItem
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TestListItem test={filteredTests[index]} />
    </div>
  )}
</List>
```

**Performance note:** For 100-500 items, virtualization provides noticeable improvement. Below 100 items, standard rendering is acceptable — consider conditional virtualization.

**Confidence:** HIGH — react-window is mature, widely used, and fits the fixed-height use case

---

### Micro-Visualizations (Sparklines)

| Technology | Version | Purpose | Bundle Impact |
|------------|---------|---------|---------------|
| Recharts (existing) | ^2.15.4 | Sparklines via TinyLineChart pattern | 0KB (existing) |

**Why use existing Recharts over MUI X Charts or dedicated library:**
- Recharts already in bundle (~45KB) — adding MUI X Charts would duplicate
- Recharts supports "tiny" chart pattern natively
- No additional dependency = no additional maintenance

**Why NOT @mui/x-charts:**
- Would add significant bundle (~100KB+)
- Duplicates Recharts functionality already present
- Overkill — sparklines are simple stripped-down LineCharts

**Why NOT react-sparklines:**
- Last updated 2021, minimal maintenance
- Recharts tiny chart pattern achieves same result

**Sparkline implementation with existing Recharts:**
```typescript
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const Sparkline = ({ data }: { data: number[] }) => (
  <ResponsiveContainer width={60} height={24}>
    <LineChart data={data.map((v, i) => ({ v, i }))}>
      <Line
        type="monotone"
        dataKey="v"
        stroke={theme.palette.primary.main}
        strokeWidth={1.5}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
)
```

**Key sparkline characteristics:**
- No axes, no grid, no labels
- Width 40-80px, height 20-30px
- Single line or area fill
- Optional: last point dot for current value

**Confidence:** HIGH — Recharts TinyLineChart pattern is documented

---

### Progress Rings

| Technology | Version | Purpose | Bundle Impact |
|------------|---------|---------|---------------|
| MUI CircularProgress | (built-in MUI 5) | Pass rate rings, status indicators | 0KB (existing) |

**Why MUI CircularProgress over custom SVG:**
- Already styled to match MUI theme
- Supports determinate mode with value prop
- Consistent with rest of UI
- Zero additional code for basic progress rings

**Implementation for pass rate ring:**
```typescript
import { CircularProgress, Box, Typography } from '@mui/material'

const PassRateRing = ({ passRate }: { passRate: number }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    {/* Background ring */}
    <CircularProgress
      variant="determinate"
      value={100}
      sx={{ color: 'grey.200' }}
    />
    {/* Foreground ring */}
    <CircularProgress
      variant="determinate"
      value={passRate}
      sx={{
        color: passRate > 80 ? 'success.main' : passRate > 50 ? 'warning.main' : 'error.main',
        position: 'absolute',
        left: 0,
      }}
    />
    {/* Center label */}
    <Box sx={{ /* center positioning */ }}>
      <Typography variant="caption">{passRate}%</Typography>
    </Box>
  </Box>
)
```

**When custom SVG would be needed (NOT v1.2):**
- Non-circular shapes (semi-circles, arcs)
- Multiple segments with different colors
- Complex animations beyond simple fill

**Confidence:** HIGH — Standard MUI pattern, well-documented

---

## Summary: What to Add

### Install

```bash
npm install react-window @types/react-window
```

### Do NOT Install

| Library | Reason |
|---------|--------|
| framer-motion | Overkill — MUI transitions sufficient |
| @mui/x-charts | Duplicates Recharts, large bundle |
| react-virtuoso | Larger bundle, features not needed |
| react-sparklines | Unmaintained, Recharts handles it |
| Custom theme solution | MUI colorSchemes is superior |

---

## Integration Notes

### Theme System Integration

Current `App.tsx` uses basic `createTheme()`. Migration to colorSchemes:

```typescript
// Before
const theme = createTheme()

// After
const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  defaultColorScheme: 'system',
  // Preserve existing customizations
})
```

Add theme toggle component using `useColorScheme` hook.

### Virtual Scrolling Integration

Current `TestList/index.tsx` uses `<List>` with `overflow: auto`. Replace with `FixedSizeList`:

1. Keep existing grouping logic (groupBySuite)
2. Flatten groups for virtualization OR virtualize within groups
3. Consider: simple flat list virtualization first, grouped later if needed

### Recharts Sparkline Integration

Current `TrendsChart.tsx` already uses Recharts. Add sparkline components as smaller variants without axes/grid.

### MUI Transitions Integration

Wrap components that should animate on mount/unmount:

```typescript
<Fade in={showContent} timeout={300}>
  <Box>{content}</Box>
</Fade>
```

---

## Bundle Impact Analysis

| Addition | Gzipped Size | Justification |
|----------|--------------|---------------|
| react-window | ~6KB | Essential for 100-500 item performance |
| **Total** | **~6KB** | Minimal impact |

**Current bundle (estimated):** ~150KB gzipped (React + MUI + MobX + Recharts + Zod)
**After v1.2:** ~156KB gzipped (+4% increase)

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Theme system (colorSchemes) | HIGH | Official MUI documentation, stable API |
| Animations (MUI Transitions) | HIGH | Built-in, well-documented, already in bundle |
| Virtual scrolling (react-window) | HIGH | Mature library, fits fixed-height use case |
| Sparklines (Recharts) | HIGH | Already using Recharts, pattern documented |
| Progress rings (CircularProgress) | HIGH | Standard MUI component |

---

## Sources

### Official Documentation
- [MUI Dark Mode](https://mui.com/material-ui/customization/dark-mode/) — colorSchemes API, useColorScheme hook
- [MUI Transitions](https://mui.com/material-ui/transitions/) — Fade, Collapse, Grow, Slide components
- [MUI CircularProgress](https://mui.com/material-ui/react-progress/) — Progress ring implementation
- [MUI X Sparkline](https://mui.com/x/react-charts/sparkline/) — Reference for sparkline patterns
- [Recharts TinyLineChart](https://recharts.org/en-US/examples/TinyLineChart/) — Sparkline implementation

### Comparison Resources
- [react-window vs react-virtuoso](https://medium.com/@stuthineal/infinite-scrolling-made-easy-react-window-vs-react-virtuso-1fd786058a73) — Bundle size and feature comparison
- [npm-compare virtualization](https://npm-compare.com/react-infinite-scroll-component,react-virtuoso,react-window) — Package statistics
- [Framer Motion bundle optimization](https://motion.dev/docs/react-reduce-bundle-size) — LazyMotion patterns
- [React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — Comparison of options

### Bundle Analysis
- [Bundlephobia react-window](https://bundlephobia.com/package/react-window)
- [Bundlephobia react-virtuoso](https://bundlephobia.com/package/react-virtuoso)
- [Bundlephobia framer-motion](https://bundlephobia.com/package/framer-motion)
