# Domain Pitfalls: v1.2 Design Refresh

**Domain:** Design system refresh for existing React/MUI 5 test report viewer
**Researched:** 2026-02-10
**Confidence:** HIGH (verified with official MUI docs and established patterns)

## Critical Pitfalls

Mistakes that cause rewrites, major UX issues, or significant technical debt.

### Pitfall 1: Flash of Wrong Theme (FOWT)

**What goes wrong:** User sees light theme flash before dark theme loads, causing jarring visual experience. Especially problematic in low-light environments where QA engineers often work.

**Why it happens:**
1. Theme preference stored in localStorage is read asynchronously after initial render
2. React hydration completes before localStorage check
3. CSS-in-JS (Emotion) generates styles after JavaScript executes

**Consequences:**
- Poor UX for dark mode users (majority of developers/QA engineers)
- Perceived performance degradation
- User complaints about "blinking" interface

**Prevention:**
1. **Use MUI's CSS variables approach** with `CssVarsProvider` instead of traditional `createTheme`
2. **Add blocking script in HTML `<head>`** before React loads:
   ```html
   <script>
     (function() {
       const stored = localStorage.getItem('theme-mode');
       const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
       const mode = stored || (prefersDark ? 'dark' : 'light');
       document.documentElement.setAttribute('data-mui-color-scheme', mode);
     })();
   </script>
   ```
3. **For static HTML export:** Inline this script in `index.html` (not external JS file)

**Detection:**
- Open app in dark mode preference, observe any white flash
- Test on slow connection (throttle network in DevTools)
- Test with cleared localStorage

**Affected Phase:** Theme System (Phase 1)

**Sources:**
- [MUI Dark Mode Documentation](https://mui.com/material-ui/customization/dark-mode/)
- [FOUDT: Flash of Unstyled Dark Theme](https://webcloud.se/blog/2020-04-06-flash-of-unstyled-dark-theme/)

---

### Pitfall 2: Animation Jank on Low-End Devices

**What goes wrong:** Animations stutter, drop frames, or cause the UI to feel sluggish. Test reports may be viewed on CI machines, older laptops, or via remote desktop where GPU acceleration is limited.

**Why it happens:**
1. Animating non-compositor properties (width, height, top, left, padding, margin)
2. Too many simultaneous animations triggering layout recalculations
3. Animations blocking main thread
4. Missing `will-change` hints for complex animations

**Consequences:**
- UI feels "janky" and unprofessional
- Users disable animations or avoid using features
- Negative perception of product quality
- Potential accessibility issues for users sensitive to motion

**Prevention:**
1. **Only animate compositor-friendly properties:** `transform`, `opacity`, `filter`
   ```css
   /* BAD - causes layout/repaint */
   .card { transition: width 0.3s; }

   /* GOOD - GPU accelerated */
   .card { transition: transform 0.3s; }
   ```

2. **Respect `prefers-reduced-motion`:**
   ```typescript
   // With Framer Motion
   <MotionConfig reducedMotion="user">
     <App />
   </MotionConfig>

   // Or CSS
   @media (prefers-reduced-motion: reduce) {
     * { animation-duration: 0.001ms !important; }
   }
   ```

3. **Limit concurrent animations:** Max 3-4 simultaneous animated elements

4. **Use `will-change` sparingly:** Only on elements about to animate, remove after

**Detection:**
- Test on CPU 4x slowdown in Chrome DevTools
- Test with "Reduce motion" enabled in OS settings
- Profile with Performance tab, look for long frames (>16ms)

**Affected Phase:** Microinteractions (Phase 4)

**Sources:**
- [CSS GPU Animation: Doing It Right](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
- [Motion Accessibility Guide](https://motion.dev/docs/react-accessibility)
- [Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list)

---

### Pitfall 3: Virtual Scrolling Breaking Accessibility

**What goes wrong:** Screen readers cannot navigate the full test list, keyboard navigation fails, or scroll position is lost when filtering/searching.

**Why it happens:**
1. Virtual scrolling removes DOM elements that screen readers rely on
2. Missing ARIA attributes for conveying list size and position
3. Focus management not maintained when items are recycled
4. Scroll position not preserved across filter changes

**Consequences:**
- Product unusable for visually impaired users (accessibility violation)
- Keyboard-only users cannot navigate effectively
- Users lose their place when filtering large test lists
- Potential legal/compliance issues

**Prevention:**
1. **Use proper ARIA attributes:**
   ```tsx
   <li
     role="listitem"
     aria-setsize={totalItems}    // Total items in full list
     aria-posinset={itemIndex}    // Current item position
   >
   ```

2. **Preserve scroll position on filter changes:**
   ```typescript
   // TanStack Virtual approach
   const virtualizer = useVirtualizer({
     count: filteredItems.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 60,
     initialOffset: savedScrollPosition,  // Restore on re-render
   });
   ```

3. **Implement focus management:**
   - Track focused item by ID, not index
   - After filter, focus nearest valid item
   - Announce list changes to screen readers

4. **Provide "scroll to top/bottom" controls** for keyboard users

**Detection:**
- Test with VoiceOver (Mac) or NVDA (Windows)
- Navigate entire list using only keyboard (Tab, Arrow keys)
- Filter list and verify position is maintained
- Test "items 1-50 of 500" announcements

**Affected Phase:** Performance Optimization (Phase 5)

**Sources:**
- [Ensuring Accessibility in Virtualized Components](https://app.studyraid.com/en/read/11538/362764/ensuring-accessibility-in-virtualized-components)
- [TanStack Virtual Documentation](https://tanstack.com/virtual/latest/docs/api/virtualizer)

---

### Pitfall 4: Z-Index Wars with Sidebar/Modal/AppBar

**What goes wrong:** Elements overlap incorrectly - sidebar appears under AppBar, modals appear behind sidebar, dropdowns get clipped.

**Why it happens:**
1. Multiple stacking contexts created by `position: fixed/sticky`, `transform`, `opacity < 1`
2. Arbitrary z-index values without system ("z-index: 9999" arms race)
3. MUI components have their own z-index tokens that conflict with custom values
4. Child elements cannot exceed parent stacking context

**Consequences:**
- UI looks broken with overlapping elements
- Users cannot interact with obscured elements
- Constant firefighting as new features break existing layout
- Difficult to debug and maintain

**Prevention:**
1. **Use MUI's z-index scale consistently:**
   ```typescript
   const theme = createTheme({
     zIndex: {
       mobileStepper: 1000,
       speedDial: 1050,
       appBar: 1100,
       drawer: 1200,
       modal: 1300,
       snackbar: 1400,
       tooltip: 1500,
     },
   });
   ```

2. **Keep sidebar and modals at same DOM level:**
   ```tsx
   // BAD - modal inside content creates nested stacking context
   <Content>
     <Modal />
   </Content>

   // GOOD - portal to body
   <Content />
   <Portal><Modal /></Portal>  // MUI does this by default
   ```

3. **Audit stacking context creation:**
   - Every `position: fixed/sticky/relative` with z-index creates context
   - Every `transform`, `filter`, `opacity < 1` creates context
   - Use browser DevTools "Layers" panel to visualize

4. **Document z-index tokens in theme:**
   ```typescript
   // Custom tokens following MUI convention
   zIndex: {
     ...theme.zIndex,
     sidebar: 1150,      // Between appBar and drawer
     sidebarOverlay: 1149,
   }
   ```

**Detection:**
- Open sidebar + modal simultaneously
- Check dropdown menus near AppBar
- Test with browser zoom at 150%, 200%
- Use Chrome DevTools Layers panel

**Affected Phase:** Sidebar Navigation (Phase 3)

**Sources:**
- [CSS Position Sticky Z-Index Issue](https://www.codegenes.net/blog/css-position-sticky-and-z-index-overlay-modal/)
- [Why Z-Index Isn't Working](https://coder-coder.com/z-index-isnt-working/)

---

## Moderate Pitfalls

Issues that cause significant rework or degraded UX but are recoverable.

### Pitfall 5: sx Prop Sprawl vs Theme System

**What goes wrong:** Styling becomes inconsistent and unmaintainable. Same colors, spacing, and styles defined differently across components.

**Why it happens:**
1. `sx` prop is convenient for one-off styles, leading to overuse
2. Developers bypass theme tokens for quick fixes
3. No enforcement of design tokens
4. Copy-paste of sx objects across components

**Consequences:**
- Inconsistent visual design (different grays, spacing)
- Theme changes don't propagate (dark mode breaks in some places)
- Larger bundle size from duplicate style definitions
- Harder to maintain and update design system

**Prevention:**
1. **Rule: sx for one-off, theme for reusable:**
   ```typescript
   // ONE-OFF - sx is fine
   <Box sx={{ mt: 2 }}>

   // REUSABLE - use theme components
   const theme = createTheme({
     components: {
       MuiCard: {
         styleOverrides: {
           root: { borderRadius: 12 }
         }
       }
     }
   });
   ```

2. **Define design tokens in theme:**
   ```typescript
   const theme = createTheme({
     spacing: 8,  // Base unit
     shape: { borderRadius: 8 },
     palette: {
       // All colors here, never hardcoded
     },
   });
   ```

3. **Lint against hardcoded values:**
   - Configure ESLint to warn on hex colors in sx
   - Prefer `theme.palette.x` and `theme.spacing(n)`

4. **Create styled variants for common patterns:**
   ```typescript
   const StatsCard = styled(Card)(({ theme }) => ({
     padding: theme.spacing(2),
     borderRadius: theme.shape.borderRadius * 1.5,
   }));
   ```

**Detection:**
- Search codebase for hardcoded colors (`#`, `rgb(`)
- Check if theme change updates all components
- Count `sx` prop usages vs theme component customizations

**Affected Phase:** Theme System (Phase 1), All subsequent phases

**Sources:**
- [MUI How to Customize](https://mui.com/material-ui/customization/how-to-customize/)
- [MUI Optimization Guide](https://medium.com/@jayeshsevatkar55/mui-optimization-guide-b4c43df41b3a)

---

### Pitfall 6: Bento Grid Responsive Breakpoint Chaos

**What goes wrong:** Cards overlap, overflow containers, or leave awkward gaps at certain screen sizes. Layout looks great at design widths but breaks at real-world widths.

**Why it happens:**
1. Testing only at exact breakpoint values (768px, 1024px) not ranges
2. Content-driven sizing conflicts with grid-defined sizing
3. `grid-template-areas` strings don't match column count
4. Missing `minmax()` causing content overflow

**Consequences:**
- Broken layouts at common screen sizes (iPad, small laptops)
- Content overflow causing horizontal scroll
- Cards with very different content heights looking unbalanced
- Constant CSS fixes for edge cases

**Prevention:**
1. **Use `minmax()` for flexible columns:**
   ```css
   /* Responsive without media queries */
   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
   ```

2. **Test at breakpoint boundaries:**
   - Test at 767px, 768px, 769px (not just 768px)
   - Test at 1023px, 1024px, 1025px
   - Test with browser zoom

3. **Handle content overflow explicitly:**
   ```css
   .bento-card {
     min-width: 0;           /* Allow shrinking below content size */
     overflow: hidden;
     text-overflow: ellipsis;
   }
   ```

4. **Use container queries for component-level responsiveness:**
   ```css
   @container (max-width: 300px) {
     .stats-card { flex-direction: column; }
   }
   ```

5. **Define explicit grid areas for complex layouts:**
   ```css
   /* Ensure row definitions match column count */
   grid-template-areas:
     "stats stats trends trends"    /* 4 columns */
     "health timeline alerts alerts"; /* Must also be 4 */
   ```

**Detection:**
- Resize browser continuously from 320px to 1920px
- Test with long content (long test names, many suites)
- Test with minimum content (empty states)

**Affected Phase:** Bento Grid Layout (Phase 2)

**Sources:**
- [Build a Bento Layout with CSS Grid](https://iamsteve.me/blog/bento-layout-css-grid)
- [Advanced CSS Grid Layouts 2025](https://jonimms.com/advanced-css-grid-layouts-wordpress-themes-2025/)

---

### Pitfall 7: Sidebar Mobile Responsiveness Issues

**What goes wrong:** Sidebar either doesn't work on mobile, is always visible consuming screen space, or has touch interaction issues.

**Why it happens:**
1. Using wrong MUI Drawer variant for screen size
2. Not handling touch gestures (swipe to close)
3. Backdrop not properly covering content
4. Sidebar width doesn't adapt to screen size

**Consequences:**
- Mobile users cannot access sidebar features
- Sidebar obscures entire mobile screen
- Touch users cannot dismiss sidebar intuitively
- Portrait/landscape transitions break layout

**Prevention:**
1. **Switch Drawer variant by breakpoint:**
   ```tsx
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

   <Drawer
     variant={isMobile ? 'temporary' : 'persistent'}
     open={isOpen}
     onClose={handleClose}
   >
   ```

2. **Use appropriate width per breakpoint:**
   ```typescript
   const drawerWidth = {
     xs: '100vw',      // Full screen on mobile
     sm: '80vw',       // Most of screen on tablet
     md: '400px',      // Fixed on desktop
     lg: '40vw',       // Proportional on large screens
   };
   ```

3. **Enable swipe gestures:**
   ```tsx
   <SwipeableDrawer
     onOpen={handleOpen}
     onClose={handleClose}
     swipeAreaWidth={20}
     disableSwipeToOpen={false}
   />
   ```

4. **Ensure backdrop covers fixed AppBar:**
   - Use Portal to render at body level
   - Set backdrop z-index appropriately

**Detection:**
- Test on actual mobile devices (not just Chrome DevTools)
- Test touch gestures (swipe, tap outside to close)
- Test orientation changes
- Test with soft keyboard visible

**Affected Phase:** Sidebar Navigation (Phase 3)

**Sources:**
- [MUI React Drawer Component](https://mui.com/material-ui/react-drawer/)
- [MUI Breakpoints and Responsive Design](https://muhimasri.com/blogs/mui-breakpoint/)

---

### Pitfall 8: Bundle Size Bloat from MUI Imports

**What goes wrong:** Bundle size grows significantly, causing slower load times. Especially problematic for static HTML export where users load from file system.

**Why it happens:**
1. Barrel imports (`import { Button, Card, ... } from '@mui/material'`)
2. Importing entire icon library
3. Adding animation libraries without considering size
4. Development convenience habits carry to production

**Consequences:**
- Slow initial load (especially on file:// protocol)
- Longer time to interactive
- Poor performance metrics
- Users waiting for report to load

**Prevention:**
1. **Use path imports for MUI:**
   ```typescript
   // BAD - imports entire barrel
   import { Button, Card } from '@mui/material';

   // GOOD - tree-shakeable
   import Button from '@mui/material/Button';
   import Card from '@mui/material/Card';
   ```

2. **Use path imports for icons (critical):**
   ```typescript
   // BAD - can import 6x slower, larger bundle
   import { CheckCircle } from '@mui/icons-material';

   // GOOD
   import CheckCircle from '@mui/icons-material/CheckCircle';
   ```

3. **Configure bundler for MUI optimization:**
   ```typescript
   // vite.config.ts - if using Vite
   export default defineConfig({
     optimizeDeps: {
       include: ['@mui/material', '@emotion/react', '@emotion/styled'],
     },
   });
   ```

4. **Consider lighter animation alternatives:**
   - CSS animations for simple effects (0 KB)
   - `motion` (Framer Motion) is ~15KB gzipped
   - Evaluate if animation library is worth the cost

5. **Analyze bundle regularly:**
   ```bash
   npx vite-bundle-analyzer
   ```

**Detection:**
- Run `npm run build` and check output sizes
- Use bundle analyzer to identify large dependencies
- Compare build size before/after adding features

**Affected Phase:** All phases, especially Microinteractions (Phase 4)

**Sources:**
- [MUI Minimizing Bundle Size](https://mui.com/material-ui/guides/minimizing-bundle-size/)
- [Reducing Bundle Size for React and MUI](https://medium.com/@sargun.kohli152/reducing-bundle-size-for-react-and-mui-using-tree-shaking-a-comprehensive-guide-f4bd709bc0c3)

---

## Minor Pitfalls

Issues that cause friction but have straightforward fixes.

### Pitfall 9: MobX Observer Missing on Theme-Dependent Components

**What goes wrong:** Components don't re-render when theme changes, showing stale colors or wrong mode.

**Why it happens:**
1. Forgetting to wrap component in `observer()` when reading from ThemeStore
2. Dereferencing observable too early (in parent, passing primitive)
3. Theme state stored in MobX but read incorrectly

**Prevention:**
1. **Always wrap components reading observables:**
   ```tsx
   export const ThemeToggle = observer(() => {
     const { themeStore } = useRootStore();
     return <Switch checked={themeStore.isDark} />;
   });
   ```

2. **Dereference late:**
   ```tsx
   // BAD - mode is primitive, won't trigger re-render
   const mode = themeStore.mode;
   return <Child mode={mode} />;

   // GOOD - pass store, dereference in child
   return <Child themeStore={themeStore} />;
   ```

**Detection:**
- Toggle theme and verify all components update
- Check MobX DevTools for observer subscriptions

**Affected Phase:** Theme System (Phase 1)

**Sources:**
- [MobX React Optimizations](https://mobx.js.org/react-optimizations.html)

---

### Pitfall 10: localStorage Unavailable on file:// Protocol

**What goes wrong:** Theme preference doesn't persist when opening static HTML from file system.

**Why it happens:**
- Some browsers restrict localStorage on `file://` protocol for security
- Safari is particularly restrictive

**Prevention:**
1. **Always wrap localStorage in try/catch:**
   ```typescript
   const getStoredTheme = (): string | null => {
     try {
       return localStorage.getItem('theme-mode');
     } catch {
       return null;  // Fall back to system preference
     }
   };
   ```

2. **Graceful degradation to system preference:**
   ```typescript
   const mode = getStoredTheme()
     ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
   ```

**Detection:**
- Open built HTML directly (not via server)
- Test in Safari with strict privacy settings
- Clear localStorage and verify fallback works

**Affected Phase:** Theme System (Phase 1)

---

### Pitfall 11: Inconsistent Transition Durations

**What goes wrong:** UI feels chaotic with elements animating at different speeds.

**Why it happens:**
- Different developers using different duration values
- Copy-pasting CSS with hardcoded durations
- No defined motion system

**Prevention:**
1. **Define motion tokens in theme:**
   ```typescript
   const theme = createTheme({
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
       },
     },
   });
   ```

2. **Use theme tokens consistently:**
   ```tsx
   <Box sx={{
     transition: theme => theme.transitions.create(['background'], {
       duration: theme.transitions.duration.short,
     })
   }}>
   ```

**Detection:**
- Review all `transition` CSS properties
- Watch UI for timing inconsistencies

**Affected Phase:** Microinteractions (Phase 4)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| **Phase 1: Theme System** | FOWT (#1), localStorage issues (#10), MobX observer (#9) | Blocking script in HTML head, try/catch for storage, verify all components observe |
| **Phase 2: Bento Grid** | Responsive breakpoints (#6), content overflow | Use minmax(), test at boundary widths, explicit overflow handling |
| **Phase 3: Sidebar** | Z-index wars (#4), mobile issues (#7) | Use MUI z-index scale, switch variant by breakpoint, test touch |
| **Phase 4: Microinteractions** | Animation jank (#2), bundle bloat (#8), timing (#11) | Only animate transform/opacity, respect reduced-motion, use path imports, define motion tokens |
| **Phase 5: Performance** | Virtual scroll accessibility (#3), scroll position loss | ARIA attributes, preserve scroll on filter, focus management |

## Pre-Implementation Checklist

Before starting each phase, verify:

- [ ] Design tokens defined in theme (colors, spacing, motion)
- [ ] Z-index scale documented and followed
- [ ] Import patterns established (path imports for MUI)
- [ ] Accessibility requirements documented
- [ ] Bundle size baseline measured
- [ ] Test devices/browsers identified

## Sources

- [MUI Dark Mode Documentation](https://mui.com/material-ui/customization/dark-mode/)
- [MUI How to Customize](https://mui.com/material-ui/customization/how-to-customize/)
- [MUI Minimizing Bundle Size](https://mui.com/material-ui/guides/minimizing-bundle-size/)
- [MUI React Drawer Component](https://mui.com/material-ui/react-drawer/)
- [MobX React Optimizations](https://mobx.js.org/react-optimizations.html)
- [CSS GPU Animation: Doing It Right](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
- [Motion Accessibility Guide](https://motion.dev/docs/react-accessibility)
- [TanStack Virtual Documentation](https://tanstack.com/virtual/latest/docs/api/virtualizer)
- [Build a Bento Layout with CSS Grid](https://iamsteve.me/blog/bento-layout-css-grid)
- [Z-Index and Stacking Contexts](https://coder-coder.com/z-index-isnt-working/)
