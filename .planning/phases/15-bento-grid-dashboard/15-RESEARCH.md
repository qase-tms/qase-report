# Phase 15: Bento Grid Dashboard - Research

**Researched:** 2026-02-10
**Domain:** CSS Grid layout, React data visualization, responsive dashboard design
**Confidence:** MEDIUM-HIGH

## Summary

Bento Grid is a modern dashboard layout pattern inspired by Japanese bento boxes, where content is organized in variable-sized rectangular cards that communicate visual hierarchy through size differences. The implementation requires CSS Grid (not MUI Grid) for multi-row/column spanning capabilities, paired with Recharts for micro-visualizations (sparklines) and MUI CircularProgress for progress rings.

The project already uses Recharts v2.15.4 and MUI v5.12.0, providing all necessary dependencies. The key technical challenges are: (1) implementing responsive CSS Grid breakpoints at 900px and 1280px as specified, (2) creating minimal sparkline configurations by hiding axes, and (3) integrating MUI Cards with CSS Grid layout without fighting MUI's Flexbox-based Grid system.

**Primary recommendation:** Use CSS Grid with `grid-template-columns` spanning patterns for layout, hide Recharts axes for sparklines, and wrap MUI CircularProgress with percentage text as children for progress rings.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.2.0 | Component framework | Already in project |
| TypeScript | ^5.9.3 | Type safety | Already in project |
| CSS Grid | Native | Bento layout engine | Only CSS solution supporting row/column spans |
| MUI Material | ^5.12.0 | Card components, CircularProgress | Already in project |
| Recharts | ^2.15.4 | Sparkline charts | Already in project, used in TrendsChart |
| MobX | ^6.9.0 | State management | Already in project pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MUI useTheme | v5 | Access theme colors for charts | Theme-aware chart styling |
| ResponsiveContainer | Recharts v2.15 | Auto-sizing charts | All chart components |
| observer | mobx-react-lite v3.4.3 | Reactive components | Dashboard widgets with store data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid | MUI Grid | MUI Grid uses Flexbox and doesn't support row spanning (documented limitation) |
| Recharts | react-sparklines | Recharts already in project; adding new dependency adds complexity |
| Recharts | MUI X SparklineChart | MUI X not in dependencies; Recharts sufficient for needs |
| Custom SVG progress | CircularProgress | MUI component works, custom SVG adds maintenance burden |

**Installation:**
No new dependencies required. All libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── Dashboard/
│       ├── BentoGrid.tsx           # CSS Grid container component
│       ├── StatsCard.tsx           # Existing card (refactor for grid)
│       ├── SparklineCard.tsx       # New: Minimal Recharts line chart
│       └── ProgressRingCard.tsx    # New: CircularProgress with percentage
└── store/
    └── AnalyticsStore.ts           # Existing: Dashboard data
```

### Pattern 1: CSS Grid Bento Layout Container
**What:** Container component using CSS Grid with responsive breakpoints
**When to use:** Dashboard parent component wrapping all widgets
**Example:**
```typescript
// Source: MDN Grid Template Areas + Bento Grid patterns
import { Box } from '@mui/material'

export const BentoGrid = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2, // 16px spacing between cards

        // Mobile: single column stack
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto',

        // Tablet: 900px+ (MUI md breakpoint)
        '@media (min-width: 900px)': {
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(120px, auto)',
        },

        // Desktop: 1280px+ (MUI lg breakpoint)
        '@media (min-width: 1280px)': {
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridAutoRows: 'minmax(140px, auto)',
        },
      }}
    >
      {children}
    </Box>
  )
}
```

### Pattern 2: Variable Card Sizes with Grid Spans
**What:** Individual cards spanning multiple grid cells for size hierarchy
**When to use:** Each dashboard widget based on content importance
**Example:**
```typescript
// Source: CSS Grid span patterns
interface DashboardCardProps {
  colSpan?: number // Desktop columns to span (1-6)
  rowSpan?: number // Desktop rows to span (1-3)
  children: React.ReactNode
}

export const DashboardCard = ({
  colSpan = 1,
  rowSpan = 1,
  children
}: DashboardCardProps) => {
  return (
    <Card
      elevation={2}
      sx={{
        // Mobile: always full width
        gridColumn: 'span 1',
        gridRow: 'span 1',

        // Tablet/Desktop: apply spans
        '@media (min-width: 900px)': {
          gridColumn: `span ${Math.min(colSpan, 4)}`, // Max 4 on tablet
          gridRow: `span ${rowSpan}`,
        },
        '@media (min-width: 1280px)': {
          gridColumn: `span ${colSpan}`, // Full span on desktop
        },
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

### Pattern 3: Minimal Sparkline Configuration
**What:** Recharts LineChart/AreaChart with hidden axes for inline micro-charts
**When to use:** Trend visualization in compact card spaces
**Example:**
```typescript
// Source: Recharts API + sparkline best practices
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@mui/material'

export const SparklineCard = ({
  data,
  dataKey,
  title
}: {
  data: any[]
  dataKey: string
  title: string
}) => {
  const theme = useTheme()

  return (
    <DashboardCard colSpan={2} rowSpan={1}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // Performance optimization
          />
          <Tooltip
            contentStyle={{ fontSize: '0.75rem' }}
            cursor={false}
          />
          {/* No XAxis or YAxis components = hidden axes */}
        </LineChart>
      </ResponsiveContainer>
    </DashboardCard>
  )
}
```

### Pattern 4: Progress Ring with Centered Label
**What:** MUI CircularProgress (determinate variant) with percentage text as children
**When to use:** Displaying pass rate or completion metrics
**Example:**
```typescript
// Source: MUI CircularProgress API
import { Box, CircularProgress, Typography } from '@mui/material'

export const ProgressRingCard = ({
  value,
  title,
  size = 120
}: {
  value: number // 0-100
  title: string
  size?: number
}) => {
  return (
    <DashboardCard colSpan={1} rowSpan={1}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={value}
          size={size}
          thickness={4}
          sx={{
            color: value >= 70 ? 'success.main' : value >= 40 ? 'warning.main' : 'error.main'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" component="div">
            {Math.round(value)}%
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  )
}
```

### Anti-Patterns to Avoid
- **Using MUI Grid for Bento layout:** MUI Grid is Flexbox-based and doesn't support row spanning (documented limitation). Use CSS Grid directly.
- **All cards same size:** Defeats the purpose of Bento Grid; visual hierarchy comes from size variation.
- **More than 12-15 cards:** Overcrowding loses organizational benefits of the pattern.
- **Hardcoded nth-child positioning:** Inflexible when cards are added/removed; use grid spans on individual cards instead.
- **Including XAxis/YAxis in sparklines:** Defeats minimalism; sparklines should have NO visible axes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular progress indicator | Custom SVG circle with stroke-dasharray/offset | MUI CircularProgress | Already handles animations, accessibility, theming; custom solution misses screen reader support |
| Chart responsiveness | Manual resize listeners and width calculations | Recharts ResponsiveContainer | Uses ResizeObserver API, handles edge cases like parent container changes |
| Grid layout system | JavaScript-based grid positioning | CSS Grid native | Browser-optimized, declarative, handles responsive breakpoints naturally |
| Sparkline library | Custom canvas/SVG line drawing | Recharts with hidden axes | Already in project, handles tooltips, data updates, theme integration |

**Key insight:** Dashboard layouts involve deceptively complex edge cases (responsive resizing, theme changes, data updates, accessibility). Using existing MUI + Recharts components ensures these are handled correctly without maintenance burden.

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Not Rendering
**What goes wrong:** Recharts ResponsiveContainer shows nothing or has 0 height
**Why it happens:** Parent container has no explicit height; ResponsiveContainer needs parent dimensions to calculate size
**How to avoid:** Always set explicit height on parent or ResponsiveContainer itself (e.g., `<ResponsiveContainer width="100%" height={60}>`)
**Warning signs:** Empty space where chart should render, no console errors

### Pitfall 2: CSS Grid Mobile Responsiveness
**What goes wrong:** Bento Grid looks great on desktop but becomes unusable on mobile (tiny cards, broken layout)
**Why it happens:** Desktop grid spans (6 columns) applied to mobile viewports (320-768px) create cards too narrow to read
**How to avoid:** Always start with single-column mobile layout, progressively enhance with media queries for tablet/desktop
**Warning signs:** Horizontal scrolling on mobile, text overflow, cards narrower than 200px

### Pitfall 3: MUI Grid vs CSS Grid Confusion
**What goes wrong:** Using MUI `<Grid container>` for Bento layout, then cards won't span multiple rows
**Why it happens:** MUI Grid is Flexbox-based; Flexbox doesn't support row spanning (only CSS Grid does)
**How to avoid:** Use MUI `<Box sx={{ display: 'grid' }}>` for layout container, not `<Grid>` component
**Warning signs:** `grid-row: span 2` CSS has no effect, cards stack in single rows

### Pitfall 4: Sparkline Axis Clutter
**What goes wrong:** Sparklines show axis labels/ticks, defeating the minimal aesthetic
**Why it happens:** Including `<XAxis>` or `<YAxis>` components in LineChart (even with default props)
**How to avoid:** Completely omit XAxis/YAxis components from Recharts chart; don't use `hide={true}` (still affects layout)
**Warning signs:** Sparklines have visible labels, take up more space than expected

### Pitfall 5: CircularProgress Without Label Container
**What goes wrong:** Percentage text appears outside/misaligned with progress ring
**Why it happens:** CircularProgress children aren't automatically centered; requires absolute positioning wrapper
**How to avoid:** Use Box with `position: relative` wrapper and `position: absolute` label Box (see Pattern 4)
**Warning signs:** Text below ring instead of centered, text misaligned on different screen sizes

### Pitfall 6: Grid Gap Inconsistency Across Breakpoints
**What goes wrong:** Cards have different spacing at different screen sizes, looks unprofessional
**Why it happens:** Forgetting to maintain `gap` value across all media query breakpoints
**How to avoid:** Define `gap` once at root level (e.g., `gap: 2` = 16px in MUI sx), not in each media query
**Warning signs:** Cards closer together on mobile than desktop, inconsistent visual rhythm

## Code Examples

Verified patterns from official sources:

### Hiding Recharts Axes (Complete Omission)
```typescript
// Source: Recharts API documentation
// DON'T: Using hide prop still affects layout
<LineChart data={data}>
  <XAxis hide={true} />  {/* Still calculates space */}
  <YAxis hide={true} />
  <Line dataKey="value" />
</LineChart>

// DO: Omit axis components entirely
<LineChart data={data}>
  <Line dataKey="value" stroke="#8884d8" />
  <Tooltip />  {/* Optional: minimal tooltip */}
</LineChart>
```

### MUI Breakpoint Values (Project Reference)
```typescript
// Source: MUI v5 default breakpoints
// Available in theme.breakpoints
const breakpoints = {
  xs: 0,    // Mobile (0-599px)
  sm: 600,  // Small tablet (600-899px)
  md: 900,  // Tablet (900-1199px) ← Target for phase
  lg: 1200, // Desktop (1200-1535px) ← Close to target 1280px
  xl: 1536, // Large desktop (1536px+)
}

// Phase requirement: 900px (tablet) and 1280px (desktop)
// Use md (900px) + custom breakpoint at 1280px
```

### CSS Grid Auto-Fit vs Auto-Fill
```css
/* Source: CSS Grid best practices */

/* auto-fill: Creates empty columns if space available */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
/* Use when: Preserve grid structure even with empty columns */

/* auto-fit: Collapses empty columns, expands existing items */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* Use when: Items should fill all available space */

/* Bento Grid: Use explicit column count with spans instead */
grid-template-columns: repeat(6, 1fr); /* Better for fixed layout */
```

### Responsive Grid Gap with Clamp
```typescript
// Source: Modern CSS spacing best practices 2026
<Box
  sx={{
    display: 'grid',
    // Scales from 1rem (16px) to 2rem (32px) based on viewport
    gap: 'clamp(1rem, 2.5vw, 2rem)',
    gridTemplateColumns: 'repeat(6, 1fr)',
  }}
/>

// Simpler approach for this phase (consistent spacing)
<Box
  sx={{
    display: 'grid',
    gap: 2, // 16px in MUI theme (8px base * 2)
    gridTemplateColumns: 'repeat(6, 1fr)',
  }}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript-based Masonry layout (Isotope, Masonry.js) | CSS Grid with explicit spans | ~2022 (broad browser support) | No JS library needed, better performance, declarative |
| MUI Grid component for dashboards | CSS Grid directly (MUI Box) | Ongoing (as MUI Grid limitations discovered) | Enables row spanning, simpler responsive patterns |
| react-sparklines library | Recharts with minimal config | ~2023 (Recharts maturity) | Unified charting library, better TypeScript support |
| Custom SVG progress rings | MUI CircularProgress | MUI v5 release (2021) | Accessibility built-in, theme integration, less code |
| Fixed px breakpoints | MUI breakpoint system + custom media queries | Ongoing (responsive design evolution) | Consistent with design system, easier maintenance |

**Deprecated/outdated:**
- **MUI Grid for complex layouts:** Still supported but documented as Flexbox-based; doesn't support row spanning. Use CSS Grid (Box component) instead.
- **react-sparklines:** Last updated 2016; use Recharts or MUI X Sparkline instead.
- **Recharts v1.x:** Project uses v2.15.4; v2 has improved TypeScript support and ResponsiveContainer.

## Open Questions

1. **Optimal card size ratios for test report data**
   - What we know: Bento Grids typically use 1x1, 2x1, 2x2 span patterns
   - What's unclear: Which widgets (stats, trends, pass rate) should be emphasized with larger spans
   - Recommendation: Start with pass rate as 2x2 (primary metric), trends as 2x1 (horizontal emphasis), stats as 1x1 (compact counters). Iterate based on user feedback.

2. **Performance with many sparklines**
   - What we know: Recharts ResponsiveContainer uses ResizeObserver; each chart is independent React component
   - What's unclear: How many sparklines (5? 10? 20?) cause noticeable performance degradation
   - Recommendation: Start with 6-8 widgets per phase requirements. If performance issues arise, use `isAnimationActive={false}` on Line component and `useMemo` for data transformations.

3. **Grid layout state management**
   - What we know: MobX store pattern used in project (AnalyticsStore)
   - What's unclear: Should card visibility/order be stored in MobX or remain purely UI concern
   - Recommendation: Keep layout purely in component (not store) initially. Only add to store if user customization needed (future phase: drag-drop reordering).

4. **Accessibility for sparklines without axes**
   - What we know: Sparklines intentionally hide axes for aesthetics; Recharts has some ARIA support
   - What's unclear: Do screen readers need explicit data tables or alt text for trend charts
   - Recommendation: Add `aria-label` to sparkline containers with text like "Pass rate trend: 85% to 92% over 10 runs". Consider adding optional data table toggle for accessibility users (future enhancement).

## Sources

### Primary (HIGH confidence)
- [MUI Material-UI v5 Breakpoints Documentation](https://mui.com/material-ui/customization/breakpoints/) - Default breakpoint values (xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536)
- [MUI CircularProgress Documentation](https://mui.com/material-ui/react-progress/) - Determinate variant and custom styling
- [MDN CSS Grid Template Areas](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Grid_template_areas) - Responsive grid patterns with media queries
- [Recharts Official Documentation](https://recharts.github.io/en-US/api/Line/) - LineChart and axis configuration
- Project package.json - Verified Recharts v2.15.4 and MUI v5.12.0 already installed

### Secondary (MEDIUM confidence)
- [Building a Bento Grid Layout with Modern CSS Grid](https://www.wearedevelopers.com/en/magazine/682/building-a-bento-grid-layout-with-modern-css-grid-682) - Implementation patterns and best practices
- [Bento Grid Design Guide 2026](https://landdding.com/blog/blog-bento-grid-design-guide) - Design principles and common pitfalls
- [CSS Grid Auto-Sizing: auto-fill vs auto-fit](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/) - Grid column patterns
- [LogRocket: SVG Circular Progress with React Hooks](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) - Progress ring implementation patterns
- [Recharts ResponsiveContainer Issues](https://github.com/recharts/recharts/issues/1545) - Common height/width problems and solutions

### Secondary (MEDIUM confidence - verified with multiple sources)
- [MUI Grid vs CSS Grid](https://mui.com/material-ui/react-grid/) - MUI documentation confirming Grid uses Flexbox, not CSS Grid
- [Sparkline Best Practices](https://docs.anychart.com/Basic_Charts/Sparkline_Chart) - Axis hiding and minimal configuration
- [CSS Grid Gap Property Guide](https://thelinuxcode.com/the-css-gap-property-practical-spacing-for-grid-flexbox-and-modern-responsive-ui/) - Modern spacing patterns with clamp()

### Tertiary (LOW confidence - community resources)
- [Bentogrids.com](https://bentogrids.com/) - Visual gallery of 200+ Bento Grid examples (inspiration, no code)
- [Recharts GitHub Issues](https://github.com/recharts/recharts/issues/428) - Community discussions on hiding axes
- Various Frontend Mentor solutions - Real-world Bento Grid implementations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already in project (verified in package.json), Recharts usage confirmed in TrendsChart.tsx
- Architecture: HIGH - CSS Grid and MUI patterns well-documented by official sources (MDN, MUI docs)
- Sparklines: MEDIUM-HIGH - Recharts axis hiding verified in docs, but optimal configuration for this specific use case requires experimentation
- Progress rings: HIGH - MUI CircularProgress API documented, example implementations verified
- Responsive patterns: MEDIUM - General CSS Grid breakpoints well-understood, but specific 900px/1280px implementation for this dashboard layout needs testing
- Pitfalls: MEDIUM - Based on documented issues (GitHub, Stack Overflow) but not all pitfalls may apply to this specific project setup

**Research date:** 2026-02-10
**Valid until:** ~2026-03-12 (30 days - stable technologies, minimal API churn expected)

**Key unknowns requiring validation during planning:**
1. Exact card span configurations (1x1, 2x1, 2x2) for each widget type
2. Performance thresholds for number of simultaneous sparklines
3. Accessibility requirements for charts without axes
4. User preferences for card ordering/priority (may affect span sizes)

**Recommended next step for planner:** Create initial layout with 6-8 cards using documented patterns, then iterate based on visual hierarchy needs and performance testing.
