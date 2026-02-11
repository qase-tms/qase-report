# Phase 16: Microinteractions - Research

**Researched:** 2026-02-10
**Domain:** UI animations and transitions in React with MUI v5
**Confidence:** HIGH

## Summary

Microinteractions are subtle, task-based animations that provide visual feedback and enhance UX through smooth transitions, hover effects, and loading states. For this MUI v5 + React 18 application, implementing microinteractions means leveraging MUI's built-in transition components (Collapse, Fade, Grow, Slide, Zoom), the sx prop for hover effects, and theme.transitions API for consistent timing. Critical: all animations must respect prefers-reduced-motion for accessibility.

The codebase already uses Collapse component in SuiteGroup and TestStep components but without explicit animation awareness. Phase 16 adds fade-in animations for data loading, hover feedback on interactive elements, and accessibility support for motion-sensitive users.

**Primary recommendation:** Use MUI's transition components with theme-based durations, implement hover effects via sx prop with transform + boxShadow, create custom usePrefersReducedMotion hook, and avoid animating layout properties (width/height/position) for performance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 | Transition components (Fade, Grow, Collapse) | Already in project, built-in react-transition-group support |
| React 18 | ^18.2.0 | Concurrent rendering for smoother animations | Current project version, supports useEffect for motion detection |
| @emotion/react | ^11.10.6 | CSS-in-JS for sx prop animations | MUI dependency, optimized for dynamic styles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| window.matchMedia | Browser API | Detect prefers-reduced-motion setting | Custom hook for accessibility |
| theme.transitions | MUI theme API | Consistent animation timing | All transitions for unified UX |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI transitions | Framer Motion | Framer Motion adds 50KB+ bundle, overkill for simple fade/hover effects |
| sx prop hover | styled() components | styled() better for reusable variants, sx prop better for one-off hover states |
| Custom useReducedMotion | Framer Motion's hook | Avoid 50KB dependency for single hook, 15-line custom implementation sufficient |

**Installation:**
No new dependencies required - all features available in existing stack.

## Architecture Patterns

### Recommended Component Enhancement Structure
```
src/
├── hooks/
│   └── usePrefersReducedMotion.ts    # Custom hook for a11y
├── components/
│   ├── Dashboard/                    # Add Fade wrapper
│   ├── TestList/                     # Add hover sx styles
│   └── TestDetails/                  # Already has Collapse
└── theme/
    └── index.ts                      # Extend with transition overrides
```

### Pattern 1: Fade-In on Data Load
**What:** Wrap data-dependent components in MUI Fade, triggered by data availability
**When to use:** Dashboard cards, test lists, charts - any content that loads after initial render
**Example:**
```typescript
// Source: https://mui.com/material-ui/transitions/
import { Fade } from '@mui/material'

export const Dashboard = observer(() => {
  const { reportStore } = useRootStore()
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <Fade
      in={!!reportStore.runData}
      timeout={prefersReducedMotion ? 0 : 300}
    >
      <BentoGrid>
        {/* Dashboard content */}
      </BentoGrid>
    </Fade>
  )
})
```

### Pattern 2: Hover Effects with sx Prop
**What:** Use sx prop with '&:hover' selector, transform + boxShadow + transition
**When to use:** Interactive cards, list items, buttons - any clickable surface
**Example:**
```typescript
// Source: https://mui.com/system/getting-started/the-sx-prop/
<Box
  sx={{
    transition: theme => theme.transitions.create(
      ['transform', 'box-shadow'],
      { duration: theme.transitions.duration.shorter }
    ),
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4,
      cursor: 'pointer'
    }
  }}
>
  {/* Interactive content */}
</Box>
```

### Pattern 3: Accessible Motion Detection
**What:** Custom hook using window.matchMedia to detect prefers-reduced-motion
**When to use:** Every animated component - pass to timeout props or conditional rendering
**Example:**
```typescript
// Source: https://www.joshwcomeau.com/react/prefers-reduced-motion/
const QUERY = '(prefers-reduced-motion: no-preference)'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY)
    setPrefersReducedMotion(!mediaQueryList.matches)

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(!event.matches)
    }

    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
```

### Pattern 4: Theme-Based Transition Configuration
**What:** Extend theme with custom transition durations and easing for consistency
**When to use:** Setup once in theme/index.ts, reference throughout application
**Example:**
```typescript
// Source: https://mui.com/material-ui/customization/transitions/
export const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {},
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
})
```

### Anti-Patterns to Avoid
- **Animating width/height/position:** Forces layout reflow on every frame - use transform: scale()/translateY() instead
- **Using index as key for animated lists:** Breaks transition identity tracking - use stable IDs from data
- **Ignoring prefers-reduced-motion:** Accessibility violation - always provide zero-duration fallback
- **Chaining multiple Fade/Grow wrappers:** Performance overhead - one transition per component tree
- **Setting transitions on unmountOnExit:** Causes exit animation to be skipped - set timeout="auto" for height-based Collapse

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fade-in transitions | Custom CSS opacity keyframes | MUI Fade component | Handles mounting/unmounting, integrates with React lifecycle, 1KB |
| Collapse animations | Custom height transitions with useState | MUI Collapse with timeout="auto" | Auto-calculates dynamic height, handles overflow, 2KB |
| Motion preference detection | Custom CSS class toggling | usePrefersReducedMotion hook | Reactive to OS setting changes, SSR-safe default |
| Hover elevation effects | Custom mouseEnter/mouseLeave handlers | sx prop '&:hover' with boxShadow | Theme-integrated, no event listeners, cleaner code |
| Transition timing | Hardcoded milliseconds | theme.transitions.duration | Consistent UX, single source of truth, easier to adjust globally |

**Key insight:** MUI's transition system and sx prop handle 90% of microinteraction needs without additional dependencies. Custom animation libraries (Framer Motion, React Spring) add significant bundle size for marginal benefit in this use case.

## Common Pitfalls

### Pitfall 1: Layout Thrashing from Animating Layout Properties
**What goes wrong:** Animating width, height, left, top, or margin causes browser reflow on every frame, dropping to 15-30fps instead of 60fps
**Why it happens:** Layout properties require recalculating entire DOM tree position, repaint, and composite - expensive operations
**How to avoid:** Use transform (translateX/Y, scale) and opacity exclusively - these skip layout and paint, run on GPU compositor
**Warning signs:** Janky animations, high CPU usage in DevTools Performance tab, animations stuttering on mobile

### Pitfall 2: Forgetting prefers-reduced-motion Breaks Accessibility
**What goes wrong:** Users with vestibular disorders, epilepsy, or migraine triggers experience motion sickness or worse from animations
**Why it happens:** Developers test without accessibility settings enabled, assume animations are harmless
**How to avoid:** Implement usePrefersReducedMotion hook, conditionally set timeout={prefersReducedMotion ? 0 : 300}, test with "Reduce Motion" enabled in OS settings
**Warning signs:** WCAG 2.1 criterion 2.3.3 failure, user complaints, accessibility audit fails

### Pitfall 3: Using Index Keys Breaks Animated List Reordering
**What goes wrong:** When sorting/filtering lists, items with index keys abruptly remount instead of smoothly transitioning positions
**Why it happens:** React sees new key (index changed) and treats as different element, destroying/recreating instead of updating
**How to avoid:** Use stable IDs from data (test.id, test.signature) as keys, never Math.random() or array index for dynamic lists
**Warning signs:** List animations "pop" instead of slide, component state resets on reorder, transition callbacks fire unexpectedly

### Pitfall 4: Transition Components without "in" Prop Stay Hidden
**What goes wrong:** Fade/Grow components render but remain invisible because "in" prop defaults to false or missing
**Why it happens:** Developer forgets MUI transitions require explicit "in={true}" trigger, assumes children render by default
**How to avoid:** Always set in={!!someData} or in={isOpen} state, never rely on implicit rendering
**Warning signs:** Components not appearing, React DevTools shows component mounted but invisible, no error messages

### Pitfall 5: Stacking Multiple Wrappers Compounds Animation Timing
**What goes wrong:** Wrapping component in both Fade and Grow causes 2x duration or conflicting animations
**Why it happens:** Each wrapper adds its own transition, they don't merge
**How to avoid:** One transition wrapper per component, choose the most appropriate type (Fade for simple opacity, Collapse for height, Grow for scale)
**Warning signs:** Animations feel sluggish, elements appear in stages, cumulative delay noticeable

## Code Examples

Verified patterns from official sources:

### Dashboard Fade-In on Data Load
```typescript
// Source: https://mui.com/material-ui/transitions/
import { Fade } from '@mui/material'
import { observer } from 'mobx-react-lite'

export const Dashboard = observer(() => {
  const { reportStore } = useRootStore()
  const prefersReducedMotion = usePrefersReducedMotion()

  if (!reportStore.runData) {
    return <Typography>Load a report to view dashboard</Typography>
  }

  return (
    <Fade
      in={!!reportStore.runData}
      timeout={prefersReducedMotion ? 0 : 300}
    >
      <Box>
        <BentoGrid>
          {/* Dashboard cards */}
        </BentoGrid>
      </Box>
    </Fade>
  )
})
```

### TestListItem Hover Feedback
```typescript
// Source: https://mui.com/system/getting-started/the-sx-prop/
<ListItemButton
  onClick={() => onSelect(test.id)}
  sx={{
    borderLeft: 3,
    borderColor: statusColor,
    transition: theme => theme.transitions.create(
      ['transform', 'box-shadow', 'background-color'],
      { duration: theme.transitions.duration.shorter }
    ),
    '&:hover': {
      transform: 'translateX(4px)',
      boxShadow: 2,
      bgcolor: 'action.hover',
    }
  }}
>
  {/* Test content */}
</ListItemButton>
```

### DashboardCard Hover Elevation
```typescript
// Source: https://github.com/mui/material-ui/issues/36984
<DashboardCard
  sx={{
    transition: theme => theme.transitions.create(
      ['box-shadow', 'transform'],
      {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeInOut
      }
    ),
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4,
    }
  }}
>
  {/* Card content */}
</DashboardCard>
```

### Collapse with Accessibility (Already in Use)
```typescript
// Source: Current codebase - src/components/TestList/SuiteGroup.tsx
// Already correct pattern - add reduced motion support
const prefersReducedMotion = usePrefersReducedMotion()

<Collapse
  in={open}
  timeout={prefersReducedMotion ? 0 : 'auto'}
  unmountOnExit
>
  <List component="div" disablePadding>
    {/* Nested content */}
  </List>
</Collapse>
```

### Theme Transition Configuration
```typescript
// Source: https://mui.com/material-ui/customization/transitions/
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

export const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {},
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
})
```

### usePrefersReducedMotion Hook
```typescript
// Source: https://www.joshwcomeau.com/react/prefers-reduced-motion/
import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: no-preference)'

export function usePrefersReducedMotion() {
  // Default to true for SSR safety
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY)
    // Negate because we check for "no-preference"
    setPrefersReducedMotion(!mediaQueryList.matches)

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(!event.matches)
    }

    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS transitions only | MUI transition components | MUI v5 (2021) | Lifecycle-aware, better React integration |
| Hardcoded timing values | theme.transitions API | MUI v5 (2021) | Consistent timing, single source of truth |
| Ignored accessibility | prefers-reduced-motion support | WCAG 2.1 (2018) | Legal requirement, better UX for sensitive users |
| Layout property animations | transform/opacity GPU animations | Web Perf Best Practices (2015) | 60fps vs 15fps animations |
| react-transition-group manual | MUI built-in transitions | MUI v4+ (2019) | Less boilerplate, theme-integrated |

**Deprecated/outdated:**
- Direct react-transition-group imports: Use MUI wrappers (Fade/Grow/etc) instead, better theme integration
- Inline style animations: Use sx prop with theme.transitions, better TypeScript support and theme access
- JavaScript setTimeout for animations: Use CSS transitions via sx prop, GPU-accelerated and smoother
- Ignoring prefers-reduced-motion: Now accessibility requirement per WCAG 2.1 criterion 2.3.3

## Open Questions

1. **Should sidebar navigation have slide-in animation on first load?**
   - What we know: MUI Slide component available, would add polish to initial render
   - What's unclear: May feel slower on repeat visits, conflicts with instant usability preference
   - Recommendation: Defer to Phase 17 feedback - not in scope for Phase 16 core requirements

2. **Should chart animations respect reduced motion?**
   - What we know: Recharts has isAnimationActive prop for disabling animations
   - What's unclear: Charts already rendered in previous phases without animation consideration
   - Recommendation: Add prefersReducedMotion check to TrendsChart/SparklineCard: isAnimationActive={!prefersReducedMotion}

3. **Optimal timing for fade-in on dashboard load?**
   - What we know: Standard is 300ms, shorter is 200ms
   - What's unclear: Dashboard has many cards - may feel sluggish with 300ms
   - Recommendation: Use 200ms (shorter) for faster feedback, test with real data

## Sources

### Primary (HIGH confidence)
- [React Transition component - Material UI](https://mui.com/material-ui/transitions/) - Official MUI v5 transition components documentation
- [Transitions - Material UI](https://mui.com/material-ui/customization/transitions/) - Official theme.transitions API reference
- [The sx prop - MUI System](https://mui.com/system/getting-started/the-sx-prop/) - Official sx prop usage guide
- [Accessible Animations in React with "prefers-reduced-motion" - Josh W. Comeau](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - Definitive React accessibility guide
- [prefers-reduced-motion - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Browser API specification

### Secondary (MEDIUM confidence)
- [Reflow vs Repaint: What Every Developer Should Know - Frontend Master](https://rahuulmiishra.medium.com/reflow-vs-repaint-what-every-developer-should-know-226f073c9ad8) - Performance optimization patterns (2026)
- [10 Best Micro-interaction Examples to Improve UX](https://www.designstudiouiux.com/blog/micro-interactions-examples/) - UX best practices with timing recommendations
- [UI/UX Evolution 2026: Micro-Interactions & Motion](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/) - 2026 design trends
- [Paper Hover elevation transition - GitHub Issue #36984](https://github.com/mui/material-ui/issues/36984) - Community patterns for elevation hover

### Tertiary (LOW confidence)
- WebSearch results for duration/easing values - Cross-verified with MDN and MUI docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components exist in current MUI v5 installation, no new dependencies
- Architecture: HIGH - Patterns verified in official docs, Josh Comeau accessibility guide authoritative
- Pitfalls: MEDIUM-HIGH - Performance issues verified by multiple sources, accessibility requirements from WCAG 2.1 standard

**Research date:** 2026-02-10
**Valid until:** ~30 days (stable domain - MUI v5 mature, CSS standards stable, accessibility requirements unchanged)

**Key constraints:**
- No new npm dependencies
- Must work with existing MUI v5.12.0
- Must support prefers-reduced-motion per WCAG 2.1
- Must maintain 60fps animations for smooth UX
- Must integrate with existing theme system (experimental_extendTheme)
